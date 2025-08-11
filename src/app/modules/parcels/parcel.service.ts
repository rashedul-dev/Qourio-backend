import { Document, Types } from "mongoose";
import {
  ICreateParcel,
  ILocation,
  IParcel,
  IStatusLog,
  ParcelStatus,
  ParcelType,
  ShippingType,
} from "./parcel.interface";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { User } from "../users/user.model";
import { Parcel } from "./parcel.model";
import { IsActive, Role } from "../users/user.interface";
import { generateTrackingId } from "../../utils/generatetrackingId";
import { QueryBuilder } from "../../utils/builder/QueryBuilder";
import { date, string } from "zod";
import { populate } from "dotenv";
import { isValidStatusTransition, StatusTransitions } from "../../helpers/StatusTransition";

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

  const parcel = await Parcel.create({
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
  const cleanParcel = await Parcel.findById(parcel._id)
    .select("-recipient -statusLog._id -deliveryman -isBlocked")
    .populate("sender", "name email phone _id")
    .populate("recipient", "name email phone -_id")
    .populate("statusLog.updatedBy", "name role -_id");

  return cleanParcel;
};

const addStatusLog = (
  parcel: Document<unknown, object, IParcel> & IParcel,
  status: ParcelStatus,
  updatedBy: Types.ObjectId,
  location?: ILocation,
  note?: string
) => {
  const statusLogEntry = {
    status,
    ...(location && { location }),
    note: note || "updated by System",
    updatedBy: updatedBy,
  };

  if (!parcel.statusLog) {
    parcel.statusLog = [];
  }
  parcel.statusLog.push(statusLogEntry as IStatusLog);
};
const cancelParcel = async (senderId: string, id: string, note?: string) => {
  const parcel = await Parcel.findById(id);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel Not Found");
  }

  // if (parcel.sender.toString() !== senderId) {
  //   throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to cancel this parcel");
  // }

  if (parcel.currentStatus === ParcelStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel is already cancelled");
  }
  if (
    parcel.currentStatus === ParcelStatus.DELIVERED ||
    parcel.currentStatus === ParcelStatus.DISPATCHED ||
    parcel.currentStatus === ParcelStatus.IN_TRANSIT
  ) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel cannot be cancelled at this stage");
  }
  if (parcel.currentStatus === ParcelStatus.BLOCKED || parcel.currentStatus === ParcelStatus.FLAGGED) {
    throw new AppError(httpStatus.FORBIDDEN, "Cannot cancel blocked or flagged parcel");
  }

  parcel.currentStatus = ParcelStatus.CANCELLED;
  parcel.estimatedDelivery = null;
  parcel.deliveredAt = null;
  parcel.cancelledAt = new Date();

  addStatusLog(parcel, ParcelStatus.CANCELLED, new Types.ObjectId(senderId), parcel?.pickupAddress as ILocation, note);

  await parcel.save();

  const PopulatedParcel = await Parcel.findById(parcel._id)
    .select("-receiver -statusLog._id -deliveryman -isBlocked")
    .populate("sender", "name email phone _id")
    .populate("recipient", "name email phone -_id")
    .populate("statusLog.updatedBy", "name role -_id");

  return PopulatedParcel;
};

const deleteParcel = async (senderId: string, parcelId: string) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel Not Found");
  }
  if (parcel.sender.toString() !== senderId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this Parcel");
  }
  if (parcel.currentStatus !== ParcelStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel Must be Cancelled before deletion");
  }
  await Parcel.findByIdAndDelete(parcelId);
};

const getParcelWithTrackingHistory = async (parcelId: string, userId: string) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel Not Found");
  }
  if (!parcel.sender || !parcel.recipient) {
    throw new Error("Parcel is missing sender or recipient");
  }
  const isOwner = parcel.sender?._id?.toString() === userId || parcel.recipient?._id?.toString() === userId;

  if (!isOwner) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to view this parcel");
  }
  const populatedParcel = await Parcel.findById(parcel._id)
    .select("-type -weight -weightUnit -shippingType -fee -isPaid -isBlocked -couponCode -receiver -statusLog._id")
    .populate("sender", "name email phone -_id")
    .populate("recipient", "name email phone -_id")
    .populate("statusLog.updatedBy", "name role -_id");

  return populatedParcel;
};
const getSenderParcels = async (senderId: string, query: Record<string, string>) => {
  const parcelQuery = new QueryBuilder(
    Parcel.find({ sender: senderId })
      .select("-recipient -statusLog._id -deliveryMan -isBlocked")
      .populate("sender", "name email phone _id")
      .populate("recipient", "name email phone -_id")
      .populate("statusLog.updatedBy", "name role -_id"),
    query
  )
    .search(["trackingId", "deliveryAddress", "pickupAddress"])
    .filter()
    .sort()
    .pagination()
    .fields();

  const parcels = await parcelQuery.modelQuery;
  const meta = await parcelQuery.getMeta();

  return {
    data: parcels,
    meta: meta,
  };
};

//** --------------------- RECEIVER SERVICES -----------------------*/

const getIncomingParcels = async (recipientId: string, query: Record<string, string>) => {
  const parcelQuery = new QueryBuilder(
    Parcel.find({
      receiver: recipientId,
      currentStatus: {
        $nin: [
          ParcelStatus.DELIVERED,
          ParcelStatus.FLAGGED,
          ParcelStatus.RETURNED,
          ParcelStatus.BLOCKED,
          ParcelStatus.CANCELLED,
        ],
      },
    })
      .select(
        "-weight -weightUnit -fee -couponCode -isPaid -isBlocked -sender -statusLog._id -statusLog.updatedBy -deliveryman"
      )
      .populate("sender", "name email phone -_id")
      .populate("recipient", "name email phone _id"),
    query
  )
    .search(["trackingId", "deliveryAddress", "pickupAddress"])
    .filter()
    .sort()
    .pagination()
    .fields();

  const parcels = await parcelQuery.modelQuery;
  const meta = await parcelQuery.getMeta();

  return {
    data: parcels,
    meta,
  };
};

const confirmDelivery = async (parcelId: string, recipientId: string) => {
  const parcel = await Parcel.findOne({ _id: parcelId });

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (parcel.recipient.toString() !== recipientId) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to confirm this parcel");
  }
  if (parcel.currentStatus === ParcelStatus.DELIVERED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel already Delivered");
  }

  if (parcel.currentStatus !== ParcelStatus.IN_TRANSIT) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel must be In-Transit to confirm delivery");
  }

  parcel.currentStatus = ParcelStatus.DELIVERED;
  parcel.deliveredAt = new Date();
  parcel.cancelledAt = null;

  addStatusLog(
    parcel,
    ParcelStatus.DELIVERED,
    new Types.ObjectId(recipientId),
    parcel?.deliveryAddress as ILocation,
    "Parcel status Updated and Delivered - by receiver"
  );

  await parcel.save();

  const populatedParcel = await Parcel.findById(parcel._id)
    .select(
      "-_id -weight -weightUnit -fee -couponCode -isPaid -isBlocked -sender -receiver -statusLog._id -statusLog.updatedBy -deliveryman"
    )
    .populate("sender", "name email phone -_id");

  return populatedParcel;
};

const getDeliveryHistory = async (recipientId: string, query: Record<string, string>) => {
  const parcelQuery = new QueryBuilder(
    Parcel.find({
      recipient: recipientId,
      currentStatus: {
        $in: [ParcelStatus.DELIVERED],
      },
    })
      .select(
        "-weight -weightUnit -fee -couponCode -isPaid -isBlocked -sender -receiver -statusLog._id -statusLog.updatedBy -deliveryman"
      )
      .populate("sender", "name email phone -_id")
      .populate("recipient", "name email phone"),
    query
  )
    .search(["trackingId", "deliveryAddress", "pickupAddress"])
    .filter()
    .sort()
    .pagination()
    .fields();

  const parcels = await parcelQuery.modelQuery;
  const meta = await parcelQuery.getMeta();

  return {
    data: parcels,
    meta,
  };
};

//** --------------------- ADMIN SERVICES -----------------------*/

const getAllParcels = async (query: Record<string, string>) => {
  const parcelQuery = new QueryBuilder(Parcel.find(), query)
    .search(["trackingId", "name", "deliveryAddress", "pickupAddress"])
    .filter()
    .sort()
    .pagination()
    .fields();

  const parcels = await parcelQuery.modelQuery;
  const meta = await parcelQuery.getMeta();

  return {
    data: parcels,
    meta,
  };
};

const updateParcelStatus = async (
  parcelId: string,
  adminId: string,
  payload: {
    currentStatus?: ParcelStatus;
    currentLocation?: string;
    deliveryManId?: string;
  }
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");

  const { currentStatus, currentLocation, deliveryManId } = payload;

  if (!currentStatus && !currentLocation && !deliveryManId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Please provide at least one of currentStatus, currentLocation or deliveryManId"
    );
  }

  //  Status transition validation
  if (currentStatus && !isValidStatusTransition(parcel.currentStatus, currentStatus)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot transition from ${parcel.currentStatus} to ${currentStatus}. 
       Valid transitions: ${StatusTransitions[parcel.currentStatus].join(", ")}`
    );
  }

  //  Handle status changes
  if (currentStatus) {
    const statusActions: Partial<Record<ParcelStatus, () => void>> = {
      [ParcelStatus.CANCELLED]: () => {
        parcel.cancelledAt = new Date();
        parcel.deliveredAt = null;
      },
      [ParcelStatus.DELIVERED]: () => {
        parcel.deliveredAt = new Date();
        parcel.cancelledAt = null;
      },
      [ParcelStatus.BLOCKED]: () => {
        parcel.isBlocked = true;
        parcel.cancelledAt = null;
      },
      [ParcelStatus.APPROVED]: () => {
        parcel.isBlocked = false;
        parcel.cancelledAt = null;
      },
      [ParcelStatus.RETURNED]: () => {
        parcel.cancelledAt = null;
      },
    };

    statusActions[currentStatus]?.();
    parcel.currentStatus = currentStatus;

    const locationObj: ILocation = {
      street: payload.currentLocation || parcel.currentLocation || "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
    };

    addStatusLog(
      parcel,
      (payload.currentStatus || parcel.currentStatus) as ParcelStatus,
      new Types.ObjectId(adminId),
      locationObj,
      `Status updated by admin to ${parcel.currentStatus}`
    );
  }

  //  Update location
  if (currentLocation) parcel.currentLocation = currentLocation;
  //  Assign delivery man
  if (deliveryManId) {
    const manId = new Types.ObjectId(deliveryManId);
    const man = await User.findById(manId);

    if (!man) throw new AppError(httpStatus.BAD_REQUEST, "Delivery man not found");
    if (man.role !== Role.DELIVERY_MAN)
      throw new AppError(httpStatus.BAD_REQUEST, "Provided ID is not a delivery man ID");
    if (man.isActive !== IsActive.ACTIVE)
      throw new AppError(httpStatus.BAD_REQUEST, `Delivery man is ${man.isActive} and cannot be assigned`);
    if (!man.isVerified)
      throw new AppError(httpStatus.BAD_REQUEST, "Delivery man is not verified and cannot be assigned");

    const assignableStatuses = [
      ParcelStatus.APPROVED,
      ParcelStatus.PICKED,
      ParcelStatus.DISPATCHED,
      ParcelStatus.IN_TRANSIT,
      ParcelStatus.RESCHEDULED,
    ];

    const finalStatus = currentStatus || parcel.currentStatus;
    if (!assignableStatuses.includes(finalStatus)) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Cannot assign delivery man when parcel status is ${finalStatus}. 
         Valid statuses: ${assignableStatuses.join(", ")}`
      );
    }

    if (Array.isArray(parcel.deliveryMan) && !parcel.deliveryMan.includes(manId)) {
      parcel.deliveryMan.push(manId);
    }
  }

  await parcel.save();
  return parcel;
};

const parcelStatusBlock = async (
  parcelId: string,
  adminId: string,
  payload: { reason?: string; isBlocked: boolean }
) => {
  const parcel = await Parcel.findById(parcelId);
  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  if (parcel.currentStatus === "Delivered") {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel already Delivered");
  }
  if (parcel.isBlocked) {
    throw new AppError(httpStatus.BAD_REQUEST, "Parcel already Blocked");
  }

  // check payload status and isBlocked same
  if (parcel.isBlocked === payload.isBlocked) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Parcel is already in this ${payload.isBlocked ? "blocked" : "unblocked"} status`
    );
  }

  parcel.isBlocked = payload.isBlocked;

  if (payload.isBlocked) {
    parcel.currentStatus = ParcelStatus.BLOCKED;
  } else {
    parcel.currentStatus = ParcelStatus.APPROVED;
  }
  const locationObj: ILocation = {
    street: (parcel?.currentLocation as string) || "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  };

  addStatusLog(
    parcel,
    payload.isBlocked ? ParcelStatus.BLOCKED : ParcelStatus.APPROVED,
    new Types.ObjectId(adminId),
    locationObj,
    payload.reason || "Parcel blocked by admin."
  );

  await parcel.save();

  return parcel;
};
const getParcelDetailsById = async (parcelId: string) => {
  const parcel = await Parcel.findById(parcelId);

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel not found");
  }

  return parcel;
};

//** --------------------- PUBLIC SERVICES -----------------------*/

const getParcelByTrackingId = async (trackingId: string) => {
  const parcel = await Parcel.findOne({ trackingId }).select(
    "currentStatus statusLog.status statusLog.location statusLog.updatedAt pickupAddress deliveryAddress deliveredAt"
  );

  if (!parcel) {
    throw new AppError(httpStatus.NOT_FOUND, "Parcel Not Found");
  }

  return {
    currentStatus: parcel.currentStatus,
    createdAt: parcel.createdAt,
    statusLog: parcel.statusLog,
    pickupAddress: parcel.pickupAddress,
    deliveryAddress: parcel.deliveryAddress,
    deliveredAt: parcel.deliveredAt,
  };
};
export const parcelServices = {
  //  SENDER
  createParcel,
  cancelParcel,
  deleteParcel,
  getSenderParcels,

  //  RECEIVER
  getIncomingParcels,
  confirmDelivery,
  getDeliveryHistory,

  //  ADMIN
  getAllParcels,
  updateParcelStatus,
  parcelStatusBlock,
  getParcelDetailsById,
  getParcelWithTrackingHistory,

  // PUBLIC
  getParcelByTrackingId,
};
