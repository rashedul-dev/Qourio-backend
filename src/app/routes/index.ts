import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/users/user.route";
import { ParcelRoutes } from "../modules/parcels/parcel.route";
import { OtpRoutes } from "../modules/otp/otp.routes";

export const router = Router();

const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/parcels",
    route: ParcelRoutes,
  },
  {
    path: "/otp",
    route: OtpRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route as Router);
});

// router.use("/user", UserRoutes)
// router.use("/auth",AuthRoutes )
// router.use("/parcels", ParcelRoutes)
