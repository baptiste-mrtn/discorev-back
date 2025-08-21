import { attachMedias } from "./mediaAttacher.js";

/**
 * Wrappe un modèle pour attacher automatiquement les médias à ses méthodes de lecture
 * @param {Object} model - Le modèle à wrapper
 * @param {string} targetType - 'recruiter', 'candidate', etc.
 * @param {string[]} methodsToWrap - Méthodes à enrichir avec les médias
 */
export const withMedias = (model, targetType, methodsToWrap = []) => {
	// créer un objet qui hérite de model (prototype chain)
	const wrappedModel = Object.create(model);

	for (const methodName of methodsToWrap) {
		const original = model[methodName];

		if (typeof original === "function") {
			// on bind pour conserver le this correct
			wrappedModel[methodName] = async (...args) => {
				const result = await original.apply(model, args);
				return attachMedias(result, targetType);
			};
		}
	}

	return wrappedModel;
};
