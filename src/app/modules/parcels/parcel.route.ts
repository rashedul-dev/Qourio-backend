import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../users/user.interface";
import { createParcelZodSchema } from "./parcel.validation";
import { parcelControllers } from "./parcel.controller";

const router = Router();

router.post("/", checkAuth(Role.SENDER), validateRequest(createParcelZodSchema), parcelControllers.createParcel);
router.get("/me", checkAuth(Role.SENDER), parcelControllers.getSenderParcels);
router.post("/cancel/:id", checkAuth(Role.SENDER), parcelControllers.cancelParcel);
router.post("/delete/:id", checkAuth(Role.SENDER), parcelControllers.deleteParcel);
router.get("/:id/status-log", checkAuth(Role.SENDER), parcelControllers.getParcelWithHistory);

//** --------------------- RECEIVER ROUTES -----------------------*/
router.get("/me/incoming", checkAuth(Role.RECEIVER), parcelControllers.getIncomingParcels);
router.patch("/confirm/:id", checkAuth(Role.RECEIVER), parcelControllers.confirmDelivery);
router.get("/me/history", checkAuth(Role.RECEIVER), parcelControllers.getDeliveryHistory);
export const ParcelRoutes = router;
