import { Router } from "express";
import { body } from "express-validator";
import { Role } from "shared";
import { validateRequest } from "../middleware/validate-request";
import { authenticateToken, authorize } from "../middleware/auth";
import { ProductController } from "../controllers/product.controller";

const router = Router();

const productController = new ProductController();

router.post(
  "/",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.VendorUser]),
  [
    body("name").trim().isLength({ min: 2, max: 100 }),
    body("description").trim().isLength({ min: 10, max: 1000 }),
    body("price").isFloat({ gt: 0 }),
    body("stock").isInt({ gt: -1 }),
    validateRequest,
  ],
  productController.createProduct.bind(productController),
);

router.get(
  "/",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.VendorUser, Role.ClientPortalUser]),
  productController.getProducts.bind(productController),
);

router.get(
  "/:id",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.VendorUser, Role.ClientPortalUser]),
  productController.getProduct.bind(productController),
);

router.put(
  "/:id",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.VendorUser]),
  [
    body("name").optional().trim().isLength({ min: 2, max: 100 }),
    body("description").optional().trim().isLength({ min: 10, max: 1000 }),
    body("price").optional().isFloat({ gt: 0 }),
    body("stock").optional().isInt({ gt: -1 }),
    validateRequest,
  ],
  productController.updateProduct.bind(productController),
);

router.patch(
  "/:id/stock",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.VendorUser]),
  [body("quantity").isInt({ gt: -1 }), validateRequest],
  productController.updateStock.bind(productController),
);

router.delete(
  "/:id",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.VendorUser]),
  productController.deleteProduct.bind(productController),
);

export { router as productRoutes };
