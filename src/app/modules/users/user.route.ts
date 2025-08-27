import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import {
  createAdminZodSchema,
  createDeliveryManZodSchema,
  createUserBaseZodSchema,
  updateUserBlockedStatusSchema,
  updateUserZodSchema,
} from "./user.validation";

import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { UserControllers } from "./user.controller";

const router = Router();

router.post("/register", validateRequest(createUserBaseZodSchema), UserControllers.createUser);
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getAllUsers);
router.get("/me", checkAuth(Role.SUPER_ADMIN), UserControllers.getMe);
// router.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);
router.post(
  "/create-admin",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createAdminZodSchema),
  UserControllers.createAdmin
);
router.post(
  "/create-delivery-personnel",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createDeliveryManZodSchema),
  UserControllers.createDeliveryMan
);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), UserControllers.getSingleUser);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  UserControllers.updatedUser
);
router.patch(
  "/:id/block-user",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(updateUserBlockedStatusSchema),
  UserControllers.blockStatusUser
);

export const UserRoutes = router;
