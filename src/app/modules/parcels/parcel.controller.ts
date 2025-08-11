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

//** --------------------- RECEIVER CONTROLLERS -----------------------*/

const getIncomingParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const recipientId = req.user?.userId;
  const query = req.query;

  const result = await parcelServices.getIncomingParcels(String(recipientId), query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Incoming parcels retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});
const confirmDelivery = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params?.id;
  const recipientId = req.user?.userId;

  const result = await parcelServices.confirmDelivery(parcelId, recipientId as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel Delivery Confirmed Successfully",
    data: result,
  });
});

const getDeliveryHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const recipientId = req.user?.userId;
  const query = req.query;

  const result = await parcelServices.getDeliveryHistory(String(recipientId), query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcels Delivery History retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

//** --------------------- ADMIN CONTROLLERS -----------------------*/

const getAllParcels = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query = req.query;

  const result = await parcelServices.getAllParcels(query as Record<string, string>);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All parcels retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

const updatedParcelStatus = async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params?.id;
  const adminId = req.user?.userId;

  const result = await parcelServices.updateParcelStatus(parcelId, adminId as string, req?.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcels status or Delivery Man Updated successfully",
    data: result,
  });
};
const blockStatusParcel = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const parcelId = req.params?.id;
  const adminId = req?.user?.userId;
  const { reason, isBlocked } = req.body;

  const result = await parcelServices.parcelStatusBlock(parcelId, adminId as string, {
    reason,
    isBlocked,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: `Parcel ${isBlocked ? "blocked" : "unblocked"} successfully`,
    data: result,
  });
});

//** --------------------- PUBLIC CONTROLLERS -----------------------*/

const getParcelByTrackingId = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const trackingId = req.params.id;

  const result = await parcelServices.getParcelByTrackingId(trackingId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Parcel details retrieved successfully by Tracking ID",
    data: result,
  });
});
export const parcelControllers = {
  createParcel,
  cancelParcel,
  deleteParcel,
  getParcelWithHistory,
  getSenderParcels,
  getIncomingParcels,
  confirmDelivery,
  getDeliveryHistory,
  getAllParcels,
  updatedParcelStatus,
  blockStatusParcel,
  getParcelByTrackingId,
};
