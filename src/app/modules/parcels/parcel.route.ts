import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../users/user.interface";
import { createParcelZodSchema } from "./parcel.validation";
import { parcelControllers } from "./parcel.controller";

const router = Router();

router.post(
  "/",
  checkAuth(Role.SENDER),
  validateRequest(createParcelZodSchema),
  parcelControllers.createParcel
);

export const ParcelRoutes = router;
