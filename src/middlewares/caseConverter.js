// middleware/caseConverter.js
import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

const caseConverter = (req, res, next) => {
	// Convertir les données entrantes vers snake_case
	if (req.body && typeof req.body === 'object') {
		req.body = snakecaseKeys(req.body, { deep: true });
	}
	if (req.query && typeof req.query === 'object') {
		req.query = snakecaseKeys(req.query, { deep: true });
	}
	if (req.params && typeof req.params === 'object') {
		req.params = snakecaseKeys(req.params, { deep: true });
	}

	// Intercepter res.json pour convertir la réponse en camelCase
	const originalJson = res.json;
	res.json = function (data) {
		if (typeof data === 'object') {
			const camelData = camelcaseKeys(data, { deep: true });
			return originalJson.call(this, camelData);
		}
		return originalJson.call(this, data);
	};

	next();
};

export default caseConverter;
