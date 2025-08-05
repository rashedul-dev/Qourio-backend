import { JwtPayload } from "jsonwebtoken";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { generateToken, verifyToken } from "./jwt";
import httpStatus from "http-status-codes";
import { IsActive, IUser } from "../modules/users/user.interface";
import { User } from "../modules/users/user.model";

export const createUserToken = (user: Partial<IUser>) => {
  const jwtPayload = {
    userId: user._id,
    email: user.email,
    role: user.role,
  };

  //GENERATE ACCESS_TOKEN - 1DAY
  const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

  //GENERATE REFRESH_TOKEN - 30DAY
  const refreshToken = generateToken(jwtPayload, envVars.JWT_REFRESH_SECRET, envVars.JWT_REFRESH_EXPIRES);

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
  };
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
  const verifiedRefreshToken = verifyToken(refreshToken, envVars.JWT_REFRESH_SECRET) as JwtPayload;

  const isUserExist = (await User.findOne({ email: verifiedRefreshToken.email })) as JwtPayload;

  if (!isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Doesn't exits");
  }

  if (isUserExist.isActive == IsActive.BLOCKED || isUserExist.isActive == IsActive.INACTIVE) {
    throw new AppError(httpStatus.BAD_REQUEST, `User is ${isUserExist.isActive}`);
  }
  if (isUserExist.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is Deleted");
  }
  const jwtPayload = {
    userId: isUserExist._id,
    email: isUserExist.email,
    role: isUserExist.role,
  };

  //GENERATE ACCESS_TOKEN - 7DAY
  const accessToken = generateToken(jwtPayload, envVars.JWT_ACCESS_SECRET, envVars.JWT_ACCESS_EXPIRES);

  return accessToken;
};
