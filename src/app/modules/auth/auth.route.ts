import { NextFunction, Request, Response, Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import passport from "passport";
import { Role } from "../users/user.interface";

const router = Router();
router.post("/login", AuthController.credentialsLogin);
router.post("/refresh-token", AuthController.credentialsLogin);
router.post("/logout", AuthController.logOut);
router.post("/reset-password", checkAuth(...Object.values(Role)), AuthController.resetPassword);
router.get("/google", (req: Request, res: Response, next: NextFunction) => {
  const redirect = req.query.redirect || "/";
  passport.authenticate("google", { scope: ["profile", "email"], state: redirect as string })(req, res, next);
});

//api/v1/auth/google/callback?state
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  AuthController.googleCallbackController
);

export const AuthRoutes = router;
