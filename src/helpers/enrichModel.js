// src/helpers/enrichModel.js

/**
 * Enrichit un modèle avec des enhancers sur certaines méthodes
 * @param {Object} modelInstance - instance du modèle
 * @param {Array<{ methods: string[], enhancer: Function }>} enrichments
 * @returns {Object} modèle enrichi
 */
export function enrichModel(modelInstance, enrichments = []) {
	enrichments.forEach(({ methods, enhancer }) => {
		methods.forEach((methodName) => {
			const originalMethod = modelInstance[methodName];
			if (typeof originalMethod !== "function") return;

			// On remplace la méthode par une version enrichie
			modelInstance[methodName] = async (...args) => {
				// On bind this pour conserver le contexte original
				const result = await originalMethod.apply(modelInstance, args);
				// On passe le résultat et les arguments à l'enhancer
				return enhancer(result, ...args, modelInstance);
			};
		});
	});

	return modelInstance;
}
