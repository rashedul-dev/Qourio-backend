import { Types } from "mongoose";
import { IUser } from "../users/user.interface";

export enum ParcelStatus {
  REQUESTED = "Requested",
  APPROVED = "Approved",
  PENDING = "Pending",
  PICKED = "Picked",
  DISPATCHED = "Dispatched",
  IN_TRANSIT = "In-Transit",
  RESCHEDULED = "Rescheduled",
  DELIVERED = "Delivered",
  RETURNED = "Returned",
  CANCELLED = "Cancelled",
  BLOCKED = "Blocked",
  FLAGGED = "Flagged",
  OUT_FOR_DELIVERY = "Out for Delivery",
  FAILED_ATTEMPT = "Failed Attempt",
  LOST = "Lost",
  DAMAGED = "Damaged",
  RECEIVED = "Received",
}
export enum ParcelType {
  DOCUMENT = "document",
  PACKAGE = "package",
  FRAGILE = "fragile",
  ELECTRONICS = "electronics",
  FOOD = "food",
  MEDICINE = "medicine",
  CLOTHING = "clothing",
  VALUABLE = "valuable",
  BOOKS = "books",
  OTHER = "other",
}
export enum ShippingType {
  STANDARD = "standard",
  EXPRESS = "express",
  SAME_DAY = "same_day",
  OVERNIGHT = "overnight",
}
export enum WeightUnit {
  GRAM = "g",
  KILOGRAM = "kg",
  POUND = "lb",
}
export interface IStatusLog {
  status: ParcelStatus;
  location?: ILocation;
  // timestamp: Date;
  note?: string;
  updatedBy?: Types.ObjectId | Partial<IUser>;
  updatedAt?: Date;
}
export interface ILocation {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface IRecipient {
  userId?: Types.ObjectId; // Optional: To link to a registered user
  name: string;
  email?: string; // Optional, recipient might not be a user
  phone: string;
  address: ILocation;
  // address: string;
}
export interface IParcel {
  _id: Types.ObjectId;
  trackingId: string;
  type?: ParcelType;
  shippingType?: ShippingType;
  weight?: number;
  weightUnit?: WeightUnit;
  fee?: number;
  couponCode?: string | null;
  estimatedDelivery?: Date | null; // system-generated based on shippingType
  currentStatus: ParcelStatus; // lifecycle of the parcel
  statusBeforeHold?: ParcelStatus;
  currentLocation?: string | null;
  isPaid?: boolean;
  isBlocked?: boolean;
  notes?: string;

  sender: Types.ObjectId | Partial<IUser>; // reference to User (sender)
  recipient: Types.ObjectId; // reference to User (receiver)
  pickupAddress?: object;
  deliveryAddress?: object;

  deliveryMan?: Types.ObjectId[]; // assigned delivery agents
  deliveryFee?: number;
  statusLog?: IStatusLog[]; // history of parcel statuses

  deliveredAt?: Date | null; // actual delivery timestamp
  cancelledAt?: Date | null;

  createdAt?: Date;
  updatedAt?: Date;
}
export interface ICreateParcel {
  type?: ParcelType;
  shippingType?: ShippingType;
  weight: number;
  weightUnit?: WeightUnit;
  couponCode?: string;

  senderEmail: string;
  receiverEmail: string;

  // pickupAddress?: string;
  // deliveryAddress?: string;
  pickupAddress: ILocation;
  deliveryAddress: ILocation;
  notes?: string;
}
