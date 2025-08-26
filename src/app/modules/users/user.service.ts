import AppError from "../../errorHelpers/AppError";
import { IsActive, IUser, Role } from "./user.interface";
import httpStatus from "http-status-codes";
import { User } from "./user.model";
import { envVars } from "../../config/env";
import bcryptjs from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, role, ...rest } = payload;

  if (![Role.RECEIVER, Role.SENDER, Role.DELIVERY_MAN].includes(role as Role)) {
    throw new AppError(httpStatus.CONFLICT, `Invalid role or Can not Assign ${Role} role`);
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
const blockStatusUser = async (userId: string, isActive: IsActive) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  // check payload status and isActive same
  if (user.isActive === isActive) {
    throw new AppError(httpStatus.BAD_REQUEST, `User is already in this ${isActive} status`);
  }

  user.isActive = isActive;

  if (isActive === IsActive.BLOCKED) {
    user.isActive = IsActive.BLOCKED;
  } else if (isActive === IsActive.INACTIVE) {
    user.isActive = IsActive.INACTIVE;
  } else if (isActive === IsActive.DELETED) {
    user.isActive = IsActive.DELETED;
  } else {
    user.isActive = IsActive.ACTIVE;
  }

  await user.save();

  return user;
};
const getSingleUser = async (id: string) => {
  const user = await User.findById(id).select("-password");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  return {
    data: user,
  };
};
const getMe = async (userId: string) => {
  const user = await User.findById(userId).select("-password");
  return {
    data: user,
  };
};

const createAdmin = async (payload: Partial<IUser>, decodedToken: JwtPayload) => {
  const { email, password, role, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  if (decodedToken.role == Role.ADMIN && role === Role.SUPER_ADMIN) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to create SUPER_ADMIN");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

  const user = await User.create({
    email,
    password: hashedPassword,
    role: Role.ADMIN,
    ...rest,
  });

  return user;
};
const createDeliveryMan = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });
  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

  const user = await User.create({
    email,
    password: hashedPassword,
    role: Role.DELIVERY_MAN,
    ...rest,
  });

  return user;
};

export const UserServices = {
  createUser,
  updateUser,
  getAllUsers,
  blockStatusUser,
  getSingleUser,
  getMe,
  createAdmin,
  createDeliveryMan,
};
