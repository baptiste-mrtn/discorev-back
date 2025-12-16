// -----------------------------
// OWNERSHIP MAP
// -----------------------------
export const OWNERSHIP_MAP = {
	users: "id",
	admins: "user_id",

	medias: ["uploader_id", "target_id"],
	media_permissions: "user_id",

	documents: "sender_id",
	document_permissions: "receiver_id",

	candidates: "user_id",
	applications: "candidate_id",

	recruiters: "user_id",
	recruiter_tag: "recruiter_id",
	recruiter_team_members: "recruiter_id",

	plan_history: "recruiter_id",
	subscriptions: "recruiter_id",
	websites: "recruiter_id",

	job_offers: "recruiter_id",
	conversations: ["participant1_id", "participant2_id"],
	messages: "sender_id",
	notifications: "user_id"
};

// -----------------------------
// checkRole()
// -----------------------------
export function checkRole({ accountTypes = [], adminRoles = [] }) {
	return (req, res, next) => {
		const user = req.user;
		if (!user) return res.status(401).json({ message: "Not authenticated" });

		// Admin case
		if (user.accountType === "admin") {
			if (!user.adminRole) {
				return res.status(500).json({ message: "Admin role missing on user" });
			}

			if (adminRoles.includes(user.adminRole)) {
				return next();
			}
		}

		// Non-admin roles check
		if (accountTypes.includes(user.accountType)) {
			return next();
		}

		return res.status(403).json({ message: "Forbidden" });
	};
}

// -----------------------------
// checkAdminLevel()
// -----------------------------
export function checkAdminLevel(...allowedLevels) {
	return (req, res, next) => {
		const user = req.user;

		if (!user) return res.status(401).json({ message: "Not authenticated" });
		if (user.accountType !== "admin") {
			return res.status(403).json({ message: "Forbidden" });
		}

		if (!allowedLevels.includes(user.adminRole)) {
			return res.status(403).json({ message: "Insufficient privileges" });
		}

		next();
	};
}

// -----------------------------
// checkOwnerOrRole()
// -----------------------------
export function checkOwnerOrRole(model, { adminLevels = [] } = {}) {
	return (req, res, next) => {
		const user = req.user;
		if (!user) return res.status(401).json({ message: "Not authenticated" });

		const resource = req.resource;
		if (!resource) {
			return res.status(500).json({ message: "Resource must be loaded first" });
		}

		const table = model.table;
		const fields = OWNERSHIP_MAP[table];

		if (!fields) {
			console.warn(`⚠ No ownership mapping for table: ${table}`);
			return res.status(500).json({ message: "Ownership not configured for this resource" });
		}

		console.log(user);

		// ADMIN OVERRIDE
		if (user.accountType === "admin" && adminLevels.includes(user.adminRole)) {
			return next();
		}

		// OWNER CHECK
		const ownerFields = Array.isArray(fields) ? fields : [fields];

		const isOwner = ownerFields.some((field) => {
			return String(resource[field]) === String(user.id);
		});

		if (isOwner) return next();

		return res.status(403).json({ message: "Forbidden" });
	};
}
