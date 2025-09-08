const isRecruiter = (req, res, next) => {
	if (req.user?.accountType === "recruiter" || req.user?.accountType === "admin") {
		return next();
	}
	return res.status(403).json({ message: "Recruiter role required" });
};

export default isRecruiter;