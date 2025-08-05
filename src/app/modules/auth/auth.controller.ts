import { NextFunction, Request, response, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserToken } from "../../jwt/userTokens";
import { setAuthCookie } from "../../jwt/setCookie";
import { sendResponse } from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import { envVars } from "../../config/env";

const credentialsLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("local", async (err: any, user: any, info: any) => {
    if (err) {
      return next(new AppError(401, err));
    }
    if (!user) {
      return next(new AppError(401, info.message));
    }

    const userToken = await createUserToken(user);
    const { password: pass, ...rest } = user.toObject();

    setAuthCookie(res, userToken);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "User Logged In Successfully",
      data: {
        accessToken: userToken.accessToken,
        refreshToken: userToken.refreshToken,
        user: rest,
      },
    });
  })(req, res, next);
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = await req.cookies.refreshToken;
  if (!refreshToken) {
    throw new AppError(httpStatus.BAD_REQUEST, "No refresh token received");
  }
  const tokenInfo = await AuthServices.getNewAccessToken(refreshToken as string);


  setAuthCookie(res, tokenInfo);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "New access token retrive successfully",
    data: tokenInfo,
  });
});

const logOut = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "User Logged Out Successfully",
    data: null,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;
  const decodedToken = req.user;

  await AuthServices.resetPassword(oldPassword, newPassword, decodedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password Changed Successfully",
    data: null,
  });
});

const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let redirectTo = req.query.state ? (req.query.state as string) : "";

  if (redirectTo.startsWith("/")) {
    redirectTo = redirectTo.slice(1);
  }

  const user = req.user;

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
  }

  const tokenInfo = createUserToken(user);

  setAuthCookie(res, tokenInfo);

  res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`);
});

export const AuthController = {
  credentialsLogin,
  getNewAccessToken,
  logOut,
  resetPassword,
  googleCallbackController,
};
