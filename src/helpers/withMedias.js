import { attachMedias } from "./mediaAttacher.js";

/**
 * Wrappe un modèle pour attacher automatiquement les médias à ses méthodes de lecture
 * @param {Object} model - Le modèle à wrapper
 * @param {string} targetType - 'recruiter', 'candidate', etc.
 * @param {string[]} methodsToWrap - Méthodes à enrichir avec les médias
 */
export const withMedias = (model, targetType, methodsToWrap = []) => {
	const wrappedModel = { ...model };

	for (const methodName of methodsToWrap) {
		const original = model[methodName];

		if (typeof original === "function") {
			wrappedModel[methodName] = async (...args) => {
				const result = await original(...args);
				return attachMedias(result, targetType);
			};
		}
	}

	return wrappedModel;
};
