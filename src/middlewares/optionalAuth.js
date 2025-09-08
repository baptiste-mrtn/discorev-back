import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
	const authHeader = req.headers.authorization || req.cookies.token;

	if (!authHeader) {
		// Aucun token → accès public, req.user = null
		req.user = null;
		return next();
	}

	try {
		const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = {
			id: decoded.userId,
			role: decoded.accountType || "user" // récupère role depuis payload
		};
		console.log
		next();
	} catch (err) {
		// Token invalide → accès public
		req.user = null;
		next();
	}
};

export default optionalAuth;
