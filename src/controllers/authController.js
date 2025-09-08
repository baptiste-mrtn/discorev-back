import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import History from "../models/historyModel.js";
import User from "../models/userModel.js";
import Candidate from "../models/candidateModel.js";
import Recruiter from "../models/recruiterModel.js";
import camelcaseKeys from "camelcase-keys";

class AuthController {
	register = async (req, res) => {
		const body = camelcaseKeys(req.body, { deep: true });
		const { firstName, lastName, email, password, phoneNumber, accountType, newsletter } = body;

		console.log(req.body);

		if (!firstName || !lastName || !email || !password || !accountType) {
			return res.status(400).json({ data: [], message: "Missing required fields" });
		}

		try {
			// Check if the user already exists
			// authController.js
			const existingUser = await User.getByEmail(email);
			if (existingUser) {
				return res.status(409).json({ data: [], message: "User already exists" });
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
			return res.status(500).json({ data: [], message: "Internal server error" });
		}
	};

	login = async (req, res) => {
		const { email, password, remember } = req.body;

		if (!email || !password) {
			return res.status(400).json({ data: [], message: "Missing email or password" });
		}

		try {
			const user = await User.getByEmail(email);
			if (!user) {
				return res.status(404).json({ data: [], message: "User not found" });
			}

			const isValidPassword = await bcrypt.compare(password, user.password);
			if (!isValidPassword) {
				return res.status(401).json({ data: [], message: "Invalid password" });
			}

			// ✅ Access Token (toujours court)
			const token = jwt.sign(
				{ userId: user.id, accountType: user.accountType },
				process.env.JWT_SECRET,
				{ expiresIn: "1h" } // 1 heure
			);

			let refreshToken = null;

			// ✅ Si "remember", on génère un refresh token
			if (remember) {
				refreshToken = jwt.sign(
					{ userId: user.id },
					process.env.REFRESH_TOKEN_SECRET,
					{ expiresIn: "7d" } // 7 jours
				);

				// 🔒 Sauvegarde du refresh token en BDD (optionnel mais recommandé)
				await User.update(user.id, { refreshToken });

				// Set the refresh token in a cookie in production
				// Uncomment the following line in production to set the cookie securely
				// res.cookie('refreshToken', refreshToken, {
				// 	httpOnly: true,
				// 	secure: process.env.NODE_ENV === 'production',
				// 	sameSite: 'Strict',
				// 	maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
				// });

				// ✅ Cookie sécurisé
				res.cookie("refreshToken", refreshToken, {
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "Lax",
					maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
				});
				console.log("Refresh Token:", refreshToken);
			}

			await History.logLogin(user.id);
			await User.update(user.id, { lastLogin: new Date() });

			return res.status(200).json({
				message: "Login successful",
				data: { token, refreshToken: remember ? refreshToken : null, user }
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ data: [], message: "Internal server error" });
		}
	};

	getCurrentUser = async (req, res) => {
		try {
			const user = await User.getByEmail(req.user.email);
			if (!user) {
				return res.status(404).json({ data: [], message: "User not found" });
			}
			delete user.password; // Remove sensitive data
			return res.status(200).json({ data: user, message: "User found" });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ data: [], message: "Internal server error" });
		}
	};

	refreshToken = async (req, res) => {
		try {
			const refreshToken = req.cookies.refreshToken; // 🔒 Récupéré depuis le cookie
			if (!refreshToken) {
				return res.status(401).json({ message: "No refresh token provided" });
			}

			// ✅ Vérifier refresh token en BDD (si stocké)
			const user = await User.getBy("refreshToken", refreshToken);
			if (!user) {
				return res.status(403).json({ message: "Invalid refresh token" });
			}

			// ✅ Vérifier la validité
			jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
				if (err) {
					return res.status(403).json({ message: "Invalid or expired refresh token" });
				}

				// ✅ Générer un nouvel access token
				const newAccessToken = jwt.sign(
					{ userId: decoded.userId, accountType: user.accountType },
					process.env.JWT_SECRET,
					{ expiresIn: "1h" } // toujours court
				);
				console.log("New Access Token:", newAccessToken);
				return res.status(200).json({
					message: "Token refreshed",
					data: { token: newAccessToken }
				});
			});
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Internal server error" });
		}
	};

	verifyToken = async (req, res) => {
		const authHeader = req.headers["authorization"];
		const token = authHeader && authHeader.split(" ")[1];
		if (!token) return res.sendStatus(401);
		try {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			console.log("Decoded:", decoded);

			return res.status(200).json({ valid: true, data: decoded });
		} catch (err) {
			const isExpired = err.name === "TokenExpiredError";
			return res
				.status(401)
				.json({ valid: false, error: isExpired ? "Token expired" : "Invalid token" });
		}
	};

	logout = async (req, res) => {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(400).json({ message: "Refresh token manquant." });
		}

		try {
			const user = await User.findOne({ refreshToken: refreshToken });
			if (!user) {
				return res
					.status(404)
					.json({ message: "Utilisateur non trouvé ou déjà déconnecté." });
			}

			user.refreshToken = null;
			await user.save();

			return res.status(200).json({ message: "Déconnexion réussie." });
		} catch (error) {
			console.error(error);
			return res.status(500).json({ message: "Erreur serveur." });
		}
	};
}
export default new AuthController();
