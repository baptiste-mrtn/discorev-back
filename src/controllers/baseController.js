class BaseController {
	constructor(model) {
		this.model = model;
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
			console.log(`Created new item in ${this.model.table}`);
			res.status(201).json({ message: "Created successfully", data: { id: item } });
		} catch (err) {
			next(err);
		}
	};

	update = async (req, res, next) => {
		try {
			const item = await this.model.update(req.params.id, req.body);
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
			console.log(`Deleted item with ID ${req.params.id} from ${this.model.table}`);
			res.status(200).json({ message: "Deleted successfully", data: result });
		} catch (err) {
			next(err);
		}
	};
}

export default BaseController;
