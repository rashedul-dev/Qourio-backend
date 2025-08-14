import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { UserServices } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { IsActive } from "./user.interface";

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});
const updatedUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;

  const verifiedToken = req.user;

  const payload = req.body;
  const user = await UserServices.updateUser(userId, payload, verifiedToken as JwtPayload);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "User Updated Successfully",
    data: user,
  });
});
const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const result = await UserServices.getAllUsers();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "All user retrived successfully",
    data: result.data,
    meta: result.meta,
  });
});
const blockStatusUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  const { isActive } = req.body;

  const result = await UserServices.blockStatusUser(userId, isActive);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `User ${
      isActive === IsActive.BLOCKED
        ? "Blocked"
        : isActive === IsActive.INACTIVE
        ? "Inactive"
        : isActive === IsActive.DELETED
        ? "Deleted"
        : "Active"
    } Successfully`,
    data: result,
  });
});
export const UserControllers = {
  createUser,
  updatedUser,
  getAllUsers,
  blockStatusUser,
};
