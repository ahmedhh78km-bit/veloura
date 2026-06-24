import express from 'express';
import {
  createOrder,
  getOrderById,
  getOrders,
  updateOrderStatus,
  getOrderStats
} from '../controllers/orderController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Define /stats route BEFORE /:id to prevent param matching collision
router.get('/stats', protect, getOrderStats);

router.route('/')
  .post(createOrder)
  .get(protect, getOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(protect, updateOrderStatus);

export default router;
