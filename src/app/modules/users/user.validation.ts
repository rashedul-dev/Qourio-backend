import { z } from "zod";
import { IsActive, Role } from "./user.interface";

export const createUserBaseZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." }),

  email: z
    // .string({ error: "Email must be string" })
    .email({ message: "Invalid email address format." })
    .min(5, { message: "Email must be at least 5 characters long." })
    .max(100, { message: "Email cannot exceed 100 characters." }),
  password: z
    .string({ error: "Password must be string" })
    .min(8, { message: "Password must be at least 8 characters long." })
    .regex(/^(?=.*[A-Z])/, {
      message: "Password must contain at least 1 uppercase letter.",
    })
    .regex(/^(?=.*[!@#$%^&*])/, {
      message: "Password must contain at least 1 special character.",
    })
    .regex(/^(?=.*\d)/, {
      message: "Password must contain at least 1 number.",
    }),
  phone: z
    .string({ error: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),

  defaultAddress: z
    .string({ error: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
  picture: z.url({ error: "Invalid URL format for picture." }).optional(),

  role: z.enum(Role).optional(),
});

export const updateUserZodSchema = z.object({
  name: z
    .string({ error: "Name must be string" })
    .min(2, { message: "Name must be at least 2 characters long." })
    .max(50, { message: "Name cannot exceed 50 characters." })
    .optional(),
  phone: z
    .string({ error: "Phone Number must be string" })
    .regex(/^(?:\+8801\d{9}|01\d{9})$/, {
      message: "Phone number must be valid for Bangladesh. Format: +8801XXXXXXXXX or 01XXXXXXXXX",
    })
    .optional(),
  defaultAddress: z
    .string({ error: "Address must be string" })
    .max(200, { message: "Address cannot exceed 200 characters." })
    .optional(),
  isActive: z.enum(Object.values(IsActive) as [string]).optional(),
  isDeleted: z.boolean({ error: "isDeleted must be true or false" }).optional(),
  isVerified: z.boolean({ error: "isVerified must be true or false" }).optional(),
  role: z.enum(Role).optional(),
});
export const createSenderReceiverZodSchema = createUserBaseZodSchema.extend({
  role: z.enum([Role.SENDER, Role.RECEIVER] as [string, ...string[]]),
});

export const createAdminZodSchema = createUserBaseZodSchema.extend({
  role: z.enum([Role.ADMIN, Role.SUPER_ADMIN] as [string, ...string[]]),
});

export const createDeliveryManZodSchema = createUserBaseZodSchema.extend({
  role: z.enum([Role.DELIVERY_MAN] as [string]),
});
export const updateUserStatusSchema = z.object({
  isActive: z.enum(Object.values(IsActive) as [string], { error: "A valid satus is required" }),
});
