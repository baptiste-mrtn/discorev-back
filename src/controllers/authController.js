import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import History from "../models/historyModel.js";
import Candidate from "../models/candidateModel.js";
import Recruiter from "../models/recruiterModel.js";

const AuthController = {
	async register(req, res) {
		const { firstName, lastName, email, password, phoneNumber, profilePicture, accountType, newsletter } =
			req.body;

		if (!firstName || !lastName || !email || !password || !accountType) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			// Check if the user already exists
			const existingUser = await User.getUserByEmail(email);
			if (existingUser) {
				return res.status(409).json({ message: "User already exists" });
			}

			// Hash the password
			const hashedPassword = await bcrypt.hashSync(password, 10);
			// Create the user
			const userId = await User.createUser({
				lastName,
				firstName,
				email,
				password: hashedPassword,
				phoneNumber,
				profilePicture,
				accountType,
				newsletter
			});

			// Create a candidate or a recruiter
			if (userId && accountType === "candidate") {
				try {
					const candidateId = await Candidate.createCandidate({ userId });
					await History.logAction({
						userId,
						relatedId: candidateId,
						relatedType: "auth",
						actionType: "create",
						details: "User registered as candidate"
					});
				} catch (e) {
					console.error(e);
				}
			} else if (userId && accountType === "recruiter") {
				try {
					const recruiterId = await Recruiter.createRecruiter({ userId });
					await History.logAction({
						userId,
						relatedId: recruiterId,
						relatedType: "auth",
						actionType: "create",
						details: "User registered as recruiter"
					});
				} catch (e) {
					console.error(e);
				}
			}

			return res.status(201).json({ message: "User registered successfully", userId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	// Login a user
	async login(req, res) {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ message: "Missing email or password" });
		}

		try {
			// Find the user
			const user = await User.getUserByEmail(email);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Verify the password
			bcrypt.compare(password, user.password, function (err, result) {
				if (err) {
					console.log(err);
					return res.status(401).json({ message: "Invalid password" });
				}
			});

			// Generate a JWT token
			const token = jwt.sign(
				{ userId: user.id, userType: user.userType },
				process.env.JWT_SECRET,
				{
					expiresIn: "1h"
				}
			);

			const refreshToken = jwt.sign(
				{ userId: user.id, userType: user.userType },
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: "7d" }
			);

			res.cookie('refreshToken', refreshToken, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				sameSite: 'Strict',
				maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
			});

			// Log the login action
			await History.logAction({
				userId: user.id,
				relatedId: null,
				relatedType: "auth",
				actionType: "login",
				details: "User logged in"
			});

			return res.status(200).json({
				message: "Login successful",
				token: token,
				'refresh_token' : refreshToken,
				data: user
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async getCurrentUser(req, res) {
		try {
			const user = await User.getUserById(req.user.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			delete user.password; // Remove sensitive data
			return res.status(200).json({ data: user, message: "User found" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	},

	async refreshToken(req, res) {
		const refreshToken = req.cookies.refreshToken;

		if (!refreshToken) {
			return res.status(401).json({ message: "Refresh token missing" });
		}

		try {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			const newAccessToken = jwt.sign(
				{ userId: decoded.userId, userType: decoded.userType },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);
			return res.status(200).json({ accessToken: newAccessToken });
		} catch (err) {
			console.error("Refresh token error:", err);
			return res.status(403).json({ message: "Invalid or expired refresh token" });
		}
	},

	async verifyToken(req, res){
		const authHeader = req.headers['authorization'];
		const token = authHeader && authHeader.split(' ')[1];
		if (!token) return res.sendStatus(401);

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			return res.status(200).json({ valid: true, data: decoded });
		} catch (err) {
			return res.status(401).json({ valid: false });
		}
	}
};

export default AuthController;
