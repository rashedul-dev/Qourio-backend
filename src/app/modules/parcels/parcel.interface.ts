import { Types } from "mongoose";
import { IUser } from "../users/user.interface";

export enum ParcelStatus {
  REQUESTED = "Requested", // When sender creates a parcel
  APPROVED = "Approved", // Admin confirms the parcel for delivery
  PICKED = "Picked", // Courier has picked up the parcel
  DISPATCHED = "Dispatched", // Parcel is dispatched from source hub
  IN_TRANSIT = "In-Transit", // Parcel is on the way to destination
  RESCHEDULED = "Rescheduled", // Delivery was rescheduled (e.g. receiver unavailable)
  DELIVERED = "Delivered", // Parcel successfully delivered
  RETURNED = "Returned", // Parcel was returned to sender
  CANCELLED = "Cancelled", // Cancelled by sender or admin
  BLOCKED = "Blocked", // Blocked by admin (e.g. suspicious activity)
  FLAGGED = "Flagged", // Needs manual review (e.g. payment issue)
  OUT_FOR_DELIVERY = "Out for Delivery", // Indicates courier is delivering now
  FAILED_ATTEMPT = "Failed Attempt", // Delivery attempt failed (e.g., receiver not home)
  LOST = "Lost", // Mark parcel as lost in transit
  DAMAGED = "Damaged", // Parcel arrived damaged
  RECEIVED = "Received", // Receiver has acknowledged receipt (post-delivery)
}
export enum ParcelType {
  DOCUMENT = "document",
  PACKAGE = "package",
  FRAGILE = "fragile",
  ELECTRONICS = "electronics",
  FOOD = "food", // For perishable deliveries
  MEDICINE = "medicine", // For sensitive or urgent medical items
  CLOTHING = "clothing", // Apparel-related parcels
  VALUABLE = "valuable", // Jewelry, cash, confidential items
  BOOKS = "books", // Educational or personal reading materials
  OTHER = "other", // Fallback/general-purpose
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
  timestamp: Date;
  location?: string;
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
  name: string;
  email?: string; // Optional, recipient might not be a user
  userId?: Types.ObjectId; // Optional: To link to a registered user
  phone: string;
  address: ILocation;
}
export interface IParcel {
  _id: Types.ObjectId;
  trackingId: string;
  type?: ParcelType; // e.g., document, fragile, etc.
  shippingType?: ShippingType; // e.g., standard, express, etc.
  weight?: number;
  weightUnit?: WeightUnit; // Consider using an enum (e.g., "kg", "lb", "g")
  fee?: number;
  couponCode?: string | null;
  estimatedDelivery?: Date | null; // system-generated based on shippingType
  currentStatus: ParcelStatus; // lifecycle of the parcel
  statusBeforeHold?: ParcelStatus;
  currentLocation?: ILocation;
  isPaid?: boolean;
  isBlocked?: boolean;
  notes?: string;

  sender: Types.ObjectId | Partial<IUser>; // reference to User (sender)
  recipient: IRecipient; // reference to User (receiver)
  pickupAddress?: ILocation;
  deliveryAddress?: ILocation;

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

  pickupAddress: ILocation;
  deliveryAddress: ILocation;
  notes?: string;
}
