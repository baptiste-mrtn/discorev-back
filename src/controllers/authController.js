import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import History from "../models/historyModel.js";
import User from "../models/userModel.js";
import Candidate from "../models/candidateModel.js";
import Recruiter from "../models/recruiterModel.js";

class AuthController {
	register = async (req, res) => {
		const {
			firstName,
			lastName,
			email,
			password,
			phoneNumber,
			profilePicture,
			accountType,
			newsletter
		} = req.body;

		if (!firstName || !lastName || !email || !password || !accountType) {
			return res.status(400).json({ message: "Missing required fields" });
		}

		try {
			// Check if the user already exists
			const existingUser = await User.getByEmail(email);
			if (existingUser) {
				return res.status(409).json({ message: "User already exists" });
			}

			// Hash the password
			const hashedPassword = await bcrypt.hashSync(password, 10);
			// Create the user
			const userId = await User.create({
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
					const candidateId = await Candidate.create({ userId });
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
					const recruiterId = await Recruiter.create({ userId });
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

			return res.status(201).json({ message: "User registered successfully", data: userId });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	// Login a user
	login = async (req, res) => {
		const { email, password, remember } = req.body; // récupère aussi "remember"

		if (!email || !password) {
			return res.status(400).json({ message: "Missing email or password" });
		}

		try {
			// Find the user
			const user = await User.getByEmail(email);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}

			// Verify the password
			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				return res.status(401).json({ message: "Invalid password" });
			}

			// Generate short-lived JWT access token
			const token = jwt.sign(
				{ userId: user.id, userType: user.userType },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);

			// Set the refresh token in a cookie in production
			// Uncomment the following line in production to set the cookie securely
			// res.cookie('refreshToken', refreshToken, {
			// 	httpOnly: true,
			// 	secure: process.env.NODE_ENV === 'production',
			// 	sameSite: 'Strict',
			// 	maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
			// });

			let refreshToken = null;

			// Si "remember" est coché, on génère et renvoie un refreshToken
			if (remember) {
				refreshToken = jwt.sign(
					{ userId: user.id, userType: user.userType },
					process.env.REFRESH_TOKEN_SECRET,
					{ expiresIn: "7d" }
				);

				// Stockage cookie uniquement si remember
				res.cookie("refreshToken", refreshToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "Lax",
					maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
				});
			}

			// Log the login action
			await History.logLogin(user.id);

			await User.update(user.id, { lastLogin: new Date() });

			return res.status(200).json({
				message: "Login successful",
				data: { token, refreshToken: remember ? refreshToken : null, user }
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	getCurrentUser = async (req, res) => {
		try {
			const user = await User.getById(req.user.userId);
			if (!user) {
				return res.status(404).json({ message: "User not found" });
			}
			delete user.password; // Remove sensitive data
			return res.status(200).json({ data: user, message: "User found" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	refreshToken = async (req, res) => {
		const tokenFromCookie = req.cookies.refreshToken;
		const authHeader = req.headers["authorization"];
		const tokenFromHeader = authHeader && authHeader.split(" ")[1];

		const refreshToken = tokenFromHeader || tokenFromCookie; // ✅ priorité au header

		if (!refreshToken) {
			return res.status(401).json({ message: "Refresh token missing" });
		}

		try {
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
			const accessToken = jwt.sign(
				{ userId: decoded.userId, userType: decoded.userType },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" }
			);
			console.log("refresh réussie");

			return res.status(200).json({ data: accessToken });
		} catch (err) {
			console.error("Refresh token error:", err);
			return res.status(403).json({ message: "Invalid or expired refresh token" });
		}
	};

	verifyToken = async (req, res) => {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];
		if (!token) return res.sendStatus(401);

		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			return res.status(200).json({ valid: true, data: decoded });
		} catch (err) {
			const isExpired = err.name === "TokenExpiredError";
			return res
				.status(401)
				.json({ valid: false, error: isExpired ? "Token expired" : "Invalid token" });
		}
	};
}

export default new AuthController();
