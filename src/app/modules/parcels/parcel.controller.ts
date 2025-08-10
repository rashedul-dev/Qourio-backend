/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { JwtPayload } from "jsonwebtoken";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { parcelServices } from "./parcel.service";

const createParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  console.log("Creating parcel delivery request" + req.user);
  const senderId = (req.user as JwtPayload).userId;
  const parcel = await parcelServices.createParcel(req.body, senderId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Parcel delivery request created successfully",
    data: parcel,
  });
});
const cancelParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const senderId = req.user?.id;
  const pracelId = req.params.id; //link
  const note = req.body?.note;

  const result = await parcelServices.cancelParcel(senderId, pracelId, note);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel cancelled successfully",
    data: result,
  });
});

const deleteParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params?.id;
  const senderId = req.user?.userId;

  const result = await parcelServices.deleteParcel(senderId as string, parcelId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel deleted successfully",
    data: result,
  });
});
const getParcelWithHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params.id;
  const userId = req.user?.userId;

  const result = await parcelServices.getParcelWithTrackingHistory(parcelId, userId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel details with tracking history retrieved successfully",
    data: result,
  });
});
const getSenderParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const senderId = req.user?.userId;
  const query = req.query;

  const result = await parcelServices.getSenderParcels(String(senderId), query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Sender parcels retrieved successfully",
    data: result?.data,
    meta: result.meta,
  });
});
export const parcelControllers = {
  createParcel,
  cancelParcel,
  deleteParcel,
  getParcelWithHistory,
  getSenderParcels,
};
