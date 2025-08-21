// middlewares/errorHandler.js
export default function errorHandler(err, req, res, next) {
	console.error(err.stack);
	res.status(500).json({
		message: "An error occured",
		error: err.message || "Internal server error"
	});
}
