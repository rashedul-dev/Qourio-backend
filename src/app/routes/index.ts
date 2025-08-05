import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/users/user.route";


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
  // {
  //     path: "/parcels",
  //     route: ParcelRoutes
  // },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

// router.use("/user", UserRoutes)
// router.use("/tour", TourRoutes)
// router.use("/division", DivisionRoutes)
// router.use("/booking", BookingRoutes)
// router.use("/user", UserRoutes)
