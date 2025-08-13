import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser, Role } from "./user.interface";
import httpStatus from "http-status-codes";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, role, ...rest } = payload;

  if (![Role.RECEIVER, Role.SENDER].includes(role as Role)) {
    throw new AppError(httpStatus.CONFLICT, "Invalid role");
  }

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User already Exist");
  }
  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

  const result = await User.create({
    email,
    password: hashedPassword,
    role,
    ...rest,
  });
  //Do it manually
  // const user = result.toObject();
  // delete user.password;
  //Provided by Custom Helper
  // const user = removePassword(result.toObject());
  // return user;
  //Provided by mongooose
  return result;
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const isBasicUser = [Role.SENDER, Role.RECEIVER].includes(decodedToken.role);

  if (isBasicUser && userId !== decodedToken.userId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.role && isBasicUser) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to change role");
  }

  if (
    isBasicUser &&
    (payload.isActive === IsActive.BLOCKED ||
      payload.isActive === IsActive.INACTIVE ||
      payload.isDeleted ||
      payload.isVerified)
  ) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update these fields");
  }

  const updatedUser = await User.findByIdAndUpdate(userId, payload, {
    new: true,
    runValidators: true,
  });

  return updatedUser;
};

const getAllUsers = async () => {
  const users = await User.find({});
  const totalUsers = await User.countDocuments();

  return {
    data: users,
    meta: {
      total: totalUsers,
    },
  };
};
export const UserServices = {
  createUser,
  updateUser,
  getAllUsers,
};
