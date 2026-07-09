import { Router } from "express";
import { body } from "express-validator";
import { Role } from "shared";
import { validateRequest } from "../middleware/validate-request";
import { authenticateToken, authorize } from "../middleware/auth";
import { OrderController } from "../controllers/order.controller";

const router = Router();
const orderController = new OrderController();

router.post(
  "/",
  authenticateToken,
  authorize([Role.ClientPortalUser]),
  [
    body("userId").trim().isLength({ min: 2, max: 100 }),
    body("items").isArray({ min: 1 }),
    body("items.*.productId").trim().isLength({ min: 2, max: 100 }),
    body("items.*.quantity").isInt({ gt: 0 }),
    body("items.*.price").isFloat({ gt: 0 }),
    validateRequest,
  ],
  orderController.createOrder.bind(orderController),
);

router.get(
  "/:id",
  authenticateToken,
  authorize([Role.CrmAdministrator]),
  orderController.getOrderById.bind(orderController),
);
router.get(
  "/user/:userId",
  authenticateToken,
  authorize([Role.CrmAdministrator, Role.ClientPortalUser]),
  orderController.getOrdersByUserId.bind(orderController),
);

export { router as orderRoutes };
