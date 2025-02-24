import express  from 'express';
import UserController  from '../controllers/userController.js';
import authenticateToken  from '../middlewares/authMiddleware.js';

const router = express.Router();

// Routes utilisateurs
router.get('/', authenticateToken, UserController.getAllUsers);
router.get('/:id', authenticateToken, UserController.getUserById);
router.put('/:id', authenticateToken, UserController.updateUser);
router.delete('/:id', authenticateToken, UserController.deleteUser);

export default router;
