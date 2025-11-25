class BaseController {
	constructor(model, options = {}) {
		this.model = model;
		this.enableLogs = options.enableLogs ?? true; // true par défaut
	}

	async logAction(req, actionType, relatedId = null, details = null) {
		if (!this.enableLogs) return; // ⛔ évite les boucles

		const RELATED_TYPE_MAP = {
			users: "profile",
			candidates: "profile",
			recruiters: "profile",
			job_offers: "job_offer",
			documents: "document",
			messages: "message",
			histories: "other"
		};

		const relatedType = RELATED_TYPE_MAP[this.model.table] || "other";

		try {
			await History.logAction({
				userId: req.user?.id || null,
				relatedId,
				relatedType,
				actionType,
				details
			});
		} catch (err) {
			console.error("Error while logging history:", err);
		}
	}

	getAll = async (req, res, next) => {
		try {
			const data = await this.model.getAll(req.query); // on passe query = filtres
			console.log(`Retrieved ${data.length} items from ${this.model.table}`);
			res.status(200).json({ message: "Retrieved successfully", data });
		} catch (err) {
			next(err);
		}
	};

	getOne = async (req, res, next) => {
		try {
			const item = await this.model.getById(req.params.id);
			console.log(`Retrieved item with ID ${req.params.id} from ${this.model.table}`);
			if (!item) return res.status(404).json({ message: "Not found" });
			console.log(item);
			res.status(200).json({ message: "Retrieved successfully", data: item });
		} catch (err) {
			next(err);
		}
	};

	getOneByUserId = async (req, res, next) => {
		try {
			const item = await this.model.getByUserId(req.params.userId);
			console.log(`Retrieved item for user ID ${req.params.userId} from ${this.model.table}`);
			if (!item) return res.status(404).json({ message: "Not found" });
			console.log(item);
			res.status(200).json({ message: "Retrieved successfully", data: item });
		} catch (err) {
			next(err);
		}
	};

	create = async (req, res, next) => {
		try {
			const item = await this.model.create(req.body);
			await this.logAction(
				req,
				"create",
				id,
				`Item created with id ${item} in ${this.model.table}`
			);
			console.log(`Created new item in ${this.model.table}`);
			res.status(201).json({ message: "Created successfully", data: { id: item } });
		} catch (err) {
			next(err);
		}
	};

	update = async (req, res, next) => {
		try {
			const item = await this.model.update(req.params.id, req.body);
			await this.logAction(
				req,
				"update",
				req.params.id,
				`Updated item with ID ${req.params.id} in ${this.model.table}`
			);
			console.log(`Updated item with ID ${req.params.id} in ${this.model.table}`);

			// Même logique
			res.status(200).json({
				message: "Updated successfully",
				data: { id: req.params.id } // objet
			});
		} catch (err) {
			next(err);
		}
	};

	delete = async (req, res, next) => {
		try {
			const result = await this.model.delete(req.params.id);
			await this.logAction(
				req,
				"delete",
				req.params.id,
				`Deleted item with ID ${req.params.id} from ${this.model.table}`
			);
			console.log(`Deleted item with ID ${req.params.id} from ${this.model.table}`);
			res.status(200).json({ message: "Deleted successfully", data: result });
		} catch (err) {
			next(err);
		}
	};
}

export default BaseController;
