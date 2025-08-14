import { Types } from "mongoose";
import { ILocation } from "../parcels/parcel.interface";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  // USER = "USER",
  SENDER = "SENDER",
  RECEIVER = "RECEIVER",
  DELIVERY_MAN = "DELIVERY_MAN",
}

export enum IsActive {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED",
  DELETED = "DELETED",
}
export interface IAuthProvider {
  provider: "google" | "credentials";
  providerId: string;
}
export interface IUser {
  _id?: Types.ObjectId;
  // userId?: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  picture?: string;
  role: Role;
  isVerified?: boolean;
  isActive?: IsActive;
  isDeleted?: boolean;
  defaultAddress?: ILocation;
  auths: IAuthProvider[];
}
