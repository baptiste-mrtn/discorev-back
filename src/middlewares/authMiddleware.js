import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];

	if (!authHeader) {
		return res.status(401).json({ data: [], message: "Access denied" });
	}

	const token = authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ data: [], message: "Access denied" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded.userId) {
			return res.status(400).json({ data: [], message: "Token does not contain user ID" });
		}

		const user = await User.getUserById(decoded.userId);
		if (!user) {
			return res.status(404).json({ data: [], message: "User not found" });
		}

		delete user.password; // Supprime le mot de passe par sécurité
		req.user = user;

		next();
	} catch (err) {
		return res.status(403).json({ data: [], message: "Invalid token" });
	}
};

// const authenticateTokenOptional = (req, res, next) => {
// 	const token = req.header("Authorization")?.split(" ")[1];

// 	if (!token) {
// 		req.user = null; // Pas d'utilisateur connecté
// 		return next(); // Passe à la suite sans bloquer
// 	}

// 	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
// 		if (err) {
// 			req.user = null; // Token invalide, mais on continue
// 		} else {
// 			req.user = user; // Assigne l'utilisateur si le token est valide
// 		}
// 		next(); // Passe à la suite
// 	});
// };

export default authenticateToken;
