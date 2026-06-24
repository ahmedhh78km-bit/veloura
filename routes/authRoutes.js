import express from 'express';
import { loginAdmin, verifyToken } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', loginAdmin);
router.get('/verify', protect, verifyToken);

export default router;
