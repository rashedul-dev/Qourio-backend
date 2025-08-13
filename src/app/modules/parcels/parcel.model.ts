import mongoose, { Schema, Types } from "mongoose";
import {
  ParcelStatus,
  ParcelType,
  ShippingType,
  WeightUnit,
  IStatusLog,
  ILocation,
  IRecipient,
  IParcel,
} from "./parcel.interface"; // Assuming your interfaces/enums are here

// Sub-schema for Location (used inside Recipient and addresses)
const locationSchema: object = new Schema<ILocation>({
  street: { type: String, required: true },
  city: { type: String },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, default: "Bangladesh" },
});

// Sub-schema for Recipient
const recipientSchema = new Schema<IRecipient>({
  name: { type: String, required: true },
  email: { type: String }, // optional
  userId: { type: Types.ObjectId, ref: "receiver" }, // optional receiver ref
  phone: { type: String, required: true, index: true },
  address: { type: locationSchema, required: true },
});

// Sub-schema for Status Log
const statusLogSchema = new Schema<IStatusLog>(
  {
    status: {
      type: String,
      enum: Object.values(ParcelStatus),
      required: true,
    },
    // location: { type: String },
    location: locationSchema,
    note: { type: String, max: 500 },
    updatedBy: { type: Types.ObjectId, ref: "User" },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    _id: false,
    timestamps: true,
    versionKey: false,
  }
);

// Main Parcel Schema
export const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, required: true, unique: true, index: true },
    type: { type: String, enum: Object.values(ParcelType), default: ParcelType.PACKAGE },
    shippingType: { type: String, enum: Object.values(ShippingType), default: ShippingType.STANDARD },
    weight: { type: Number, min: 0.1, max: 10 },
    weightUnit: { type: String, enum: Object.values(WeightUnit), default: WeightUnit.KILOGRAM },
    fee: { type: Number, min: 70, default: 120, required: true },
    couponCode: { type: String, max: 10, default: null },
    estimatedDelivery: { type: Date, default: null },
    currentStatus: {
      type: String,
      enum: Object.values(ParcelStatus),
      required: true,
      default: ParcelStatus.REQUESTED,
    },
    statusBeforeHold: { type: String, enum: Object.values(ParcelStatus) },
    // currentLocation: { type: locationSchema, default: null },
    currentLocation: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    notes: { type: String, max: 200 },

    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // recipient: recipientSchema,
    pickupAddress: locationSchema,
    deliveryAddress: locationSchema,
    // pickupAddress: { type: String },
    // deliveryAddress: { type: String },

    deliveryMan: { type: [Schema.Types.ObjectId], ref: "User", default: [] },

    deliveryFee: { type: Number },
    statusLog: { type: [statusLogSchema], default: [] },

    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Parcel = mongoose.model<IParcel>("Parcel", parcelSchema);
