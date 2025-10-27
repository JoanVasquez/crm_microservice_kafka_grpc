import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { authenticateToken } from '../middleware/auth';
import { OrderController } from '../controllers/order.controller';

const router = Router();
const orderController = new OrderController();

router.post('/', authenticateToken, [
    body('userId').trim().isLength({ min: 2, max: 100 }),
    body('items').isArray({ min: 1 }),
    body('items.*.productId').trim().isLength({ min: 2, max: 100 }),
    body('items.*.quantity').isInt({ gt: 0 }),
    body('items.*.price').isFloat({ gt: 0 }),
    validateRequest,
], orderController.createOrder.bind(orderController));

router.get('/:id', authenticateToken, orderController.getOrderById.bind(orderController));
router.get('/user/:userId', authenticateToken, orderController.getOrdersByUserId.bind(orderController));

export { router as orderRoutes };