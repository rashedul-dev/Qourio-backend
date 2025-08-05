import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest";
import { createUserBaseZodSchema, updateUserZodSchema } from "./user.validation";

import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { UserControllers } from "./user.controller";

const router = Router();

router.post("/register", validateRequest(createUserBaseZodSchema), UserControllers.createUser);
router.patch(
  "/:id",
  checkAuth(...Object.values(Role)),
  validateRequest(updateUserZodSchema),
  UserControllers.updatedUser
);

export const UserRoutes = router;
