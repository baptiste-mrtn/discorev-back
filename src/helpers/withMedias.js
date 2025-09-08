// src/helpers/withMedias.js
import { attachMedias } from "./mediaAttacher.js";

export async function withMedias(result, targetType, ...args) {
	return attachMedias(result, targetType);
}
