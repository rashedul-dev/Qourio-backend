/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { parcelServices } from "./parcel.service";

const createParcel = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("Creating parcel delivery request" + req.user);
    const senderId = (req.user as JwtPayload).userId;
    const parcel = await parcelServices.createParcel(req.body, senderId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Parcel delivery request created successfully",
      data: parcel,
    });
  }
);

export const parcelControllers = {
  createParcel,
};
