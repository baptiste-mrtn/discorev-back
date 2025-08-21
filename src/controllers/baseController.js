class BaseController {
	constructor(model) {
		this.model = model;
	}

	getAll = async (req, res, next) => {
		try {
			const data = await this.model.getAll(req.query); // on passe query = filtres
			res.status(200).json({ message: "Retrieved successfully", data });
		} catch (err) {
			next(err);
		}
	};

	getOne = async (req, res, next) => {
		try {
			const item = await this.model.getById(req.params.id);
			if (!item) return res.status(404).json({ message: "Not found" });
			res.status(200).json({ message: "Retrieved successfully", data: item });
		} catch (err) {
			next(err);
		}
	};

	getOneByUserId = async (req, res, next) => {
		try {
			const item = await this.model.getByUserId(req.params.id);
			if (!item) return res.status(404).json({ message: "Not found" });
			res.status(200).json({ message: "Retrieved successfully", data: item });
		} catch (err) {
			next(err);
		}
	};

	create = async (req, res, next) => {
		try {
			const item = await this.model.create(req.body);
			res.status(201).json({ message: "Created successfully", data: item });
		} catch (err) {
			next(err);
		}
	};

	update = async (req, res, next) => {
		try {
			const item = await this.model.update(req.params.id, req.body);
			res.status(200).json({ message: "Updated successfully", data: item });
		} catch (err) {
			next(err);
		}
	};

	delete = async (req, res, next) => {
		try {
			const result = await this.model.delete(req.params.id);
			res.status(200).json({ message: "Deleted successfully", data: result });
		} catch (err) {
			next(err);
		}
	};
}

export default BaseController;
