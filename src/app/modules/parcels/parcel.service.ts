import { Types } from "mongoose";
import {
  ICreateParcel,
  ILocation,
  IParcel,
  IRecipient,
  ParcelStatus,
  ParcelType,
  ShippingType,
} from "./parcel.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { User } from "../users/user.model";
import { ParcelModel } from "./parcel.model";
import { IsActive, Role } from "../users/user.interface";
import { generateTrackingId } from "../../utils/generatetrackingId";

// const createParcel = async (senderId: Types.ObjectId, payload: Partial<IParcel>) => {
//   // : Promise<IParcel>
//   let finalRecipient: IRecipient;

//   //sender provides the receiver userId
//   if (payload.recipient?.userId) {
//     if (!Types.ObjectId.isValid(payload.recipient.userId)) {
//       throw new AppError(httpStatusCode.BAD_REQUEST, "Invalid recevier user ID");
//     }

//     // find the recipient user in the data base
//     const recipientUser = await User.findById(payload.recipient?.userId);
//     if (!recipientUser) {
//       throw new AppError(httpStatusCode.NOT_FOUND, "Recipient not found by the provided id");
//     }

//     const fallbackAddress: ILocation = {
//       street: "Not Provided",
//       city: "Not Provided",
//       country: "Not Provided",
//     };

//     finalRecipient = {
//       userId: recipientUser._id,
//       name: recipientUser.name,
//       phone: recipientUser.phone || "Not Provided",
//       address: recipientUser.defaultAddress ?? fallbackAddress,
//       email: recipientUser.email,
//     };
//   } else if (
//     payload.recipient?.name &&
//     payload.recipient?.phone &&
//     payload.recipient?.address &&
//     payload.recipient?.email
//   ) {
//     finalRecipient = {
//       name: payload.recipient.name,
//       phone: payload.recipient.phone || "Not Provided",
//       address: payload.recipient.address || "Not Provoided",
//       email: payload.recipient?.email || "Not Provided",
//     };

//     if (finalRecipient.email) {
//       const recipientUser = await User.findOne({ email: finalRecipient.email });

//       if (recipientUser) {
//         finalRecipient.userId = recipientUser._id;
//       }
//     }
//   } else {
//     throw new AppError(httpStatusCode.BAD_REQUEST, "Not provied enough recipient details ");
//   }

//   const newParcelData = {
//     ...payload,
//     recipient: finalRecipient,
//     sender: new Types.ObjectId(senderId),
//     currentStatus: ParcelStatus.PENDING,

//     statusHistory: [
//       {
//         currentStatus: ParcelStatus.PENDING,
//         timestamp: new Date(),
//         updatedBy: new Types.ObjectId(senderId),
//         note: "Parcel booking created by sender",
//       },
//     ],
//   };
//   const newParcel = await ParcelModel.create();
//   return newParcel;
// };

const createParcel = async (payload: ICreateParcel, senderId: string) => {
  const trackingId = generateTrackingId();

  const { weight, receiverEmail, pickupAddress, deliveryAddress, ...rest } = payload;

  // Sender validation
  const sender = await User.findById(senderId);
  if (!sender?.phone) {
    throw new AppError(httpStatus.BAD_REQUEST, "Please Update your phone number in your profile.");
  }

  const senderAddress = pickupAddress || sender.defaultAddress;

  if (!senderAddress) {
    throw new AppError(httpStatus.BAD_REQUEST, "Pickup address is required or set a default address in your profile.");
  }

  // Receiver validation
  const receiver = await User.findOne({ email: receiverEmail });
  if (!receiver) {
    throw new AppError(httpStatus.BAD_REQUEST, "Receiver account is not found");
  }
  console.log(receiver);
  if (receiver.role !== Role.RECEIVER) {
    throw new AppError(httpStatus.BAD_REQUEST, "Provided user is not a receiver");
  }

  if (!receiver.isVerified) {
    throw new AppError(httpStatus.BAD_REQUEST, "Receiver is not verified, you cannot send parcel to this receiver");
  }

  if (receiver.isActive === IsActive.BLOCKED || receiver.isActive === IsActive.INACTIVE) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Receiver is ${receiver.isActive}. You cannot send parcel to this receiver`
    );
  }
  if (receiver.isDeleted) {
    throw new AppError(httpStatus.BAD_REQUEST, `Receiver is deleted. You cannot send parcel to this receiver`);
  }

  const receiverAddress = deliveryAddress || receiver.defaultAddress;

  if (!receiverAddress) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Delivery address is required or request receiver to add a default address in their profile."
    );
  }
  const parcelType = rest.type || ParcelType.PACKAGE;
  const shippingType = rest.shippingType || ShippingType.STANDARD;

  const parcel = await ParcelModel.create({
    trackingId,
    type: parcelType,
    shippingType,
    weight,
    sender: senderId,
    recipient: receiver,
    currentStatus: ParcelStatus.REQUESTED,
    statusLog: [
      {
        status: ParcelStatus.REQUESTED,
        location: senderAddress,
        note: "Parcel request created by sender",
        timestamp: new Date(),
        updatedBy: new Types.ObjectId(senderId),
      },
    ],
    pickupAddress: senderAddress,
    deliveryAddress: receiverAddress,
    couponCode: rest.couponCode,
    ...rest,
  });

  // Fetch the created parcel with excluded fields for privacy
  const cleanParcel = await ParcelModel.findById(parcel._id)
    .select("-recipient -statusLog._id -deliveryPersonnel -isBlocked")
    .populate("sender", "name email phone _id")
    .populate("recipient", "name email phone -_id")
    .populate("statusLog.updatedBy", "name role -_id");

  return cleanParcel;
};

export const parcelServices = {
  createParcel,
};
