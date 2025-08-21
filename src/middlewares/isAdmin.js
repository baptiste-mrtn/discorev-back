const isAdmin = async (req, res, next) => {
	try {
		const user = req.user; // injecté par ton middleware JWT (authenticateToken)

		if (!user) {
			return res.status(401).json({ message: "Non authentifié" });
		}

		if (user.accountType !== "admin") {
			return res.status(403).json({ message: "Accès refusé, réservé aux administrateurs." });
		}

		next();
	} catch (error) {
		console.error("Erreur middleware isAdmin :", error);
		return res.status(500).json({ message: "Erreur serveur." });
	}
};

export default isAdmin;
