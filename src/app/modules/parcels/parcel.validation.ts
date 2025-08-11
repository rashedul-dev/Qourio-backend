import { Types } from "mongoose";
import { z } from "zod";
import { ILocation, ParcelStatus, ParcelType, ShippingType, WeightUnit } from "./parcel.interface";

//for location
const locationZodSchema = z.object({
  street: z.string({ required_error: "Street is required" }),
  city: z.string({ required_error: "City is required" }),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string({ required_error: "Country is required" }),
});

// For sender
export const createParcelZodSchema = z.object({
  type: z.enum(Object.values(ParcelType) as [string]).optional(),
  shippingType: z.enum(Object.values(ShippingType) as [string]).optional(),
  weight: z
    .number({ invalid_type_error: "Weight must be a number" })
    .min(0.1, { message: "Weight must be at least 0.1 kg" })
    .max(10, { message: "Weight cannot exceed 10 kg" }),
  WeightUnit: z.enum(Object.values(WeightUnit) as [string]).optional(),

  couponCode: z
    .string({ invalid_type_error: "Coupon code must be a string" })
    .max(20, { message: "Coupon code cannot exceed 20 characters" })
    .optional(),
  receiverEmail: z
    .string({ invalid_type_error: "Email must be a string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." })
    .optional(),

  // pickupAddress: z
  //   .string({ invalid_type_error: "Pickup address must be string" })
  //   .min(5, { message: "Pickup address must be at least 5 characters long." })
  //   .max(100, { message: "Pickup address cannot exceed 100 characters." })
  //   .optional(),
  // deliveryAddress: z
  //   .string({ invalid_type_error: "Delivery address must be string" })
  //   .min(5, { message: "Delivery address must be at least 5 characters long." })
  //   .max(100, { message: "Delivery address cannot exceed 100 characters." })
  //   .optional(),
  pickupAddress: locationZodSchema,
  deliveryAddress: locationZodSchema,
});

// For admin
export const createParcelByAdminZodSchema = createParcelZodSchema.extend({
  senderEmail: z
    .string({ invalid_type_error: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
});

// StatusLog schema
const StatusLogSchema = z.object({
  status: z.enum(Object.values(ParcelStatus) as [string]),
  location: z.string().max(200).optional(),
  note: z.string().max(500).optional(),
  updatedBy: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), "Invalid user id")
    .optional(),
});

// Admin Update Parcel
export const updateParcelSchemaAdmin = z.object({
  trackingId: z.string().optional(),
  type: z.enum(Object.values(ParcelType) as [string]).optional(),
  shippingType: z.enum(Object.values(ShippingType) as [string]).optional(),
  weight: z.number().optional(),
  weightUnit: z.string().optional(),
  fee: z.number().optional(),
  couponCode: z.string().nullable().optional(),
  estimatedDelivery: z.date().nullable().optional(),
  currentStatus: z.enum(Object.values(ParcelStatus) as [string]).optional(),
  currentLocation: z.string().nullable().optional(),
  isPaid: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  sender: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), "Invalid sender id")
    .optional(),
  receiver: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), "Invalid receiver id")
    .optional(),
  pickupAddress: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryPersonnel: z
    .array(z.string().refine((val) => Types.ObjectId.isValid(val), "Invalid personnel id"))
    .optional(),
  statusLog: z.array(StatusLogSchema).optional(),
  deliveredAt: z.date().nullable().optional(),
  cancelledAt: z.date().nullable().optional(),
});

export const updateStatusPersonnelSchema = z.object({
  currentStatus: z.enum(Object.values(ParcelStatus) as [string]).optional(),
  currentLocation: z.string().nullable().optional(),
  deliveryManId: z
    .string()
    .refine((val) => Types.ObjectId.isValid(val), "Invalid Delivery Man id")
    .optional(),
});

export const updateBlockedStatusSchema = z.object({
  isBlocked: z.boolean({
    invalid_type_error: "isBlocked must be true or false",
  }),
  reason: z.string().optional(),
});
