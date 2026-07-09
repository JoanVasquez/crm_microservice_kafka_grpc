import { Router } from "express";
import { body } from "express-validator";
import { CRM_ROLES, RoleGroup } from "shared";
import { UserController } from "../controllers/user.controller";
import { validateRequest } from "../middleware/validate-request";
import { authenticateToken, authorize } from "../middleware/auth";

const router = Router();

const userController = new UserController();

router.get(
  "/:id",
  authenticateToken,
  authorize(RoleGroup.UserRead),
  userController.getUser.bind(userController),
);

router.get(
  "/user_by_email/:email",
  authenticateToken,
  authorize(RoleGroup.UserRead),
  userController.getUserByEmail.bind(userController),
);

router.put(
  "/:id",
  authenticateToken,
  authorize(RoleGroup.UserManagement),
  [
    body("firstName").optional().trim().isLength({ min: 2, max: 50 }),
    body("lastName").optional().trim().isLength({ min: 2, max: 50 }),
    body("isActive").optional().isBoolean(),
    body("roles").optional().isArray({ min: 1 }),
    body("roles.*").optional().isIn(CRM_ROLES),
    validateRequest,
  ],
  userController.updateUser.bind(userController),
);

router.delete(
  "/:id",
  authenticateToken,
  authorize(RoleGroup.UserManagement),
  userController.deleteUser.bind(userController),
);

export { router as userRoutes };
