import mongoose, { Schema, Types, Document, Model } from "mongoose";
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
const locationSchema = new Schema<ILocation>({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String },
  postalCode: { type: String },
  country: { type: String, required: true, default: "Bangladesh" },
});

// Sub-schema for Recipient
const recipientSchema = new Schema<IRecipient>({
  name: { type: String, required: true },
  email: { type: String }, // optional
  userId: { type: Types.ObjectId, ref: "receiver" }, // optional receiver ref
  phone: { type: String, required: true },
  address: { type: locationSchema, required: true },
});

// Sub-schema for Status Log
const statusLogSchema = new Schema<IStatusLog>({
  status: {
    type: String,
    enum: Object.values(ParcelStatus),
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
  location: { type: String },
  note: { type: String },
  updatedBy: { type: Types.ObjectId, ref: "User" },
  updatedAt: { type: Date, default: Date.now },
});

// Main Parcel Schema
const parcelSchema = new Schema<IParcel>(
  {
    trackingId: { type: String, required: true, unique: true },
    type: { type: String, enum: Object.values(ParcelType) },
    shippingType: { type: String, enum: Object.values(ShippingType) },
    weight: { type: Number },
    weightUnit: { type: String, enum: Object.values(WeightUnit) },
    fee: { type: Number },
    couponCode: { type: String, default: null },
    estimatedDelivery: { type: Date, default: null },
    currentStatus: {
      type: String,
      enum: Object.values(ParcelStatus),
      required: true,
      default: ParcelStatus.REQUESTED,
    },
    statusBeforeHold: { type: String, enum: Object.values(ParcelStatus) },
    currentLocation: { type: String, default: null },
    isPaid: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    notes: { type: String },

    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: { type: recipientSchema, required: true },

    pickupAddress: { type: locationSchema },
    deliveryAddress: { type: locationSchema },

    deliveryMan: [{ type: Types.ObjectId, ref: "User" }],

    deliveryFee: { type: Number },
    statusLog: { type: [statusLogSchema], default: [] },

    deliveredAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // auto-manage createdAt and updatedAt
  }
);

//  Pre-save hooks or methods here to generate a unique tracking number
parcelSchema.pre("save", async function (next) {
  if (this.isNew) {
    const date = new Date();

    const year = date.getFullYear();

    const month = (date.getMonth() + 1).toString().padStart(2, "0");

    const day = date.getDate().toString().padStart(2, "0");

    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();

    this.trackingId = `TRK-${year}${month}${day}-${randomPart}`;
  }
  next();
});

export const ParcelModel = mongoose.model<IParcel>("Parcel", parcelSchema);
