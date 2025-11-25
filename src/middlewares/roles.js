// middlewares/roles.js

// Vérifie si l'utilisateur est recruteur ou admin
export const isRecruiter = (req, res, next) => {
	if (req.user?.accountType === "recruiter" || req.user?.accountType === "admin") {
		return next();
	}
	return res.status(403).json({ message: "Recruiter role required" });
};

// Vérifie si l'utilisateur est admin (n'importe quel niveau)
export const isAdmin = (req, res, next) => {
	const user = req.user;
	if (!user) return res.status(401).json({ message: "Non authentifié" });

	if (user.accountType !== "admin") {
		return res.status(403).json({ message: "Accès refusé, réservé aux administrateurs." });
	}

	return next();
};

// Vérifie si l'utilisateur est admin avec un certain niveau
export const isAdminLevel =
	(...allowedLevels) =>
	(req, res, next) => {
		const user = req.user;
		if (!user) return res.status(401).json({ message: "Non authentifié" });

		if (user.accountType !== "admin" || !allowedLevels.includes(user.adminRole)) {
			return res
				.status(403)
				.json({ message: "Accès refusé, niveau administrateur insuffisant." });
		}

		return next();
	};

// Vérifie si l'utilisateur est candidat
export const isCandidate = (req, res, next) => {
	if (req.user?.accountType === "candidate") return next();
	return res.status(403).json({ message: "Candidate role required" });
};
