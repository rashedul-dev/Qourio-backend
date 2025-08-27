import { Response } from "express";
import { envVars } from "../config/env";

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

export const setAuthCookie = (res: Response, tokenInfo: AuthTokens) => {
  if (!tokenInfo.accessToken) return;

  const isProduction = envVars.NODE_ENV === "production";

  // Access Token
  res.cookie("accessToken", tokenInfo.accessToken, {
    httpOnly: true,             // not accessible by JS
    // secure: isProduction,       // must be true in production (HTTPS)
    secure: true,
    sameSite: isProduction ? "none" : "lax", // none for prod, lax for dev
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  // Refresh Token (optional)
  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      httpOnly: true,
      // secure: isProduction,
      secure: true,
      sameSite: isProduction ? "none" : "lax",
      maxAge: 60 * 24 * 60 * 60 * 1000 // 60 days
    });
  }
};
