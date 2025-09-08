import express from "express";

function crudRoutes(controller, middlewares = {}) {
	const router = express.Router();

	router.get("/", middlewares.getAll || [], controller.getAll);
	router.get("/:id", middlewares.getOne || [], controller.getOne);
	router.get("/user/:userId", middlewares.getOneByUserId || [], controller.getOneByUserId);
	router.post("/", middlewares.create || [], controller.create);
	router.put("/:id", middlewares.update || [], controller.update);
	router.delete("/:id", middlewares.delete || [], controller.delete);

	return router;
}

export default crudRoutes;
