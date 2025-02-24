import User from '../models/userModel.js';
import History from '../models/historyModel.js';

const UserController = {
    // Get all users
    async getAllUsers(req, res) {
        try {
            const users = await User.getAllUsers();
            return res.status(200).json(users);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Get user by ID
    async getUserById(req, res) {
        const userId = req.params.id;

        try {
            const user = await User.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            return res.status(200).json(user);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Update user profile
    async updateUser(req, res) {
        const userId = req.params.id;
        const updates = req.body;

        try {
            const user = await User.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await User.updateUser(userId, updates);

            // Log the update action
            await History.logAction({
                userId,
                relatedType: 'profile',
                actionType: 'update',
                details: 'User profile updated',
            });

            return res.status(200).json({ message: 'User updated successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    // Delete a user
    async deleteUser(req, res) {
        const userId = req.params.id;

        try {
            const user = await User.getUserById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            await User.deleteUser(userId);

            // Log the deletion action
            await History.logAction({
                userId,
                relatedType: 'profile',
                actionType: 'delete',
                details: 'User deleted',
            });

            return res.status(200).json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },
};

export default UserController;
