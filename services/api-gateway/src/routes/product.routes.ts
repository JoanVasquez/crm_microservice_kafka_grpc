import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import { authenticateToken } from '../middleware/auth';
import { ProductController } from '../controllers/product.controller';

const router = Router();

const productController = new ProductController();

router.post('/', authenticateToken, [
    body('name').trim().isLength({ min: 2, max: 100 }),
    body('description').trim().isLength({ min: 10, max: 1000 }),
    body('price').isFloat({ gt: 0 }),
    body('stock').isInt({ gt: -1 }),
    validateRequest,
], productController.createProduct.bind(productController));

router.get('/', productController.getProducts.bind(productController));

router.get('/:id', productController.getProduct.bind(productController));

router.put('/:id', authenticateToken, [
    body('name').optional().trim().isLength({ min: 2, max: 100 }),
    body('description').optional().trim().isLength({ min: 10, max: 1000 }),
    body('price').optional().isFloat({ gt: 0 }),
    body('stock').optional().isInt({ gt: -1 }),
    validateRequest,
], productController.updateProduct.bind(productController));

router.patch('/:id/stock', authenticateToken, [
    body('quantity').isInt({ gt: -1 }),
    validateRequest,
], productController.updateStock.bind(productController));

router.delete('/:id', authenticateToken, productController.deleteProduct.bind(productController));

export { router as productRoutes };