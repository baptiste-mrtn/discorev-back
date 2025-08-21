import dbHelpers from '../helpers/dbHelpers.js';

const History = {

	async logLogin(userId) {
		return await dbHelpers.dbInsert('histories', {
			userId,
			relatedType: 'auth',
			actionType: 'login',
		});
	},

	async logAction({userId, relatedId = null, relatedType, actionType, details = null}) {
		return await dbHelpers.dbInsert('histories', {
			userId,
			relatedId,
			relatedType,
			actionType,
			details
		});
	},


	async getUserHistory(userId) {
		const rows = await dbHelpers.dbSelect('histories', { userId });
		// Tri côté JS si nécessaire
		return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	},

	async getAllHistory() {
		const rows = await dbHelpers.dbSelect('histories');
		return rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	},

	async deleteHistoryById(historyId) {
		await dbHelpers.dbDelete('histories', { id: historyId });
	}
};

export default History;
