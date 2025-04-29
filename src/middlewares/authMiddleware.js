import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	console.log("🔑 Auth Header:", authHeader);

	if (!authHeader) {
		console.log("❌ Aucun token fourni !");
		return res.status(401).json({ message: "Access denied" });
	}

	const token = authHeader.split(" ")[1];
	console.log("📜 Token extrait:", token);

	if (!token) {
		console.log("❌ Token invalide !");
		return res.status(401).json({ message: "Access denied" });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		console.log("🔍 Token décodé:", decoded);

		if (!decoded.userId) {
			console.log("❌ Le token ne contient pas d'ID utilisateur !");
			return res.status(400).json({ message: "Token does not contain user ID" });
		}

		const user = await User.getUserById(decoded.userId);
		console.log("👤 Utilisateur trouvé dans la BD:", user);

		if (!user) {
			console.log("❌ Aucun utilisateur trouvé pour cet ID !");
			return res.status(404).json({ message: "User not found" });
		}

		delete user.password; // Supprime le mot de passe par sécurité
		req.user = user;
		console.log("✅ req.user défini :", req.user);

		next();
	} catch (err) {
		console.error("❌ Erreur lors de la vérification du token:", err);
		return res.status(403).json({ message: "Invalid token" });
	}
};

const authenticateTokenOptional = (req, res, next) => {
	const token = req.header("Authorization")?.split(" ")[1];

	if (!token) {
		req.user = null; // Pas d'utilisateur connecté
		return next(); // Passe à la suite sans bloquer
	}

	jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
		if (err) {
			req.user = null; // Token invalide, mais on continue
		} else {
			req.user = user; // Assigne l'utilisateur si le token est valide
		}
		next(); // Passe à la suite
	});
};

export { authenticateToken, authenticateTokenOptional };
