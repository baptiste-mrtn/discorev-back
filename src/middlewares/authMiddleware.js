import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authenticateToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	if (!authHeader) return res.status(401).json({ message: "Access denied" });

	const token = authHeader.split(" ")[1];
	if (!token) return res.status(401).json({ message: "Access denied" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (!decoded.userId) {
			return res.status(400).json({ message: "Token does not contain user ID" });
		}
		const user = await User.getUserById(decoded.userId); // Assurez-vous que le token contient l'ID de l'utilisateur
		if (!user) return res.status(404).json({ message: "User not found" });
		delete user.password; // Supprimez les données sensibles
		req.user = user;
		next();
	} catch (err) {
		console.error(err);
		return res.status(403).json({ message: "Invalid token" });
	}
};

export default authenticateToken;
