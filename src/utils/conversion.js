const conversion = {
	undefinedToNull(value) {
		return value === undefined ? null : value;
	},

	async camelToSnake(obj) {
		if (Array.isArray(obj)) {
			return Promise.all(obj.map((item) => this.camelToSnake(item)));
		} else if (obj !== null && typeof obj === "object") {
			const converted = {};
			for (const [key, value] of Object.entries(obj)) {
				const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
				converted[snakeKey] = this.undefinedToNull(value);
			}
			return converted;
		} else if (typeof obj === "string") {
			return obj.replace(/([A-Z])/g, "_$1").toLowerCase();
		} else {
			return this.undefinedToNull(obj);
		}
	},

	async snakeToCamel(obj) {
		if (Array.isArray(obj)) {
			return Promise.all(obj.map((item) => this.snakeToCamel(item)));
		} else if (obj !== null && typeof obj === "object") {
			const converted = {};
			for (const [key, value] of Object.entries(obj)) {
				const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
				converted[camelKey] = this.undefinedToNull(value);
			}
			return converted;
		} else if (typeof obj === "string") {
			return obj.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
		} else {
			return this.undefinedToNull(obj);
		}
	}
};

export default conversion;
