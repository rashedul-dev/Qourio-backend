import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { Role } from "../modules/users/user.interface";

export interface CustomJwtPayload extends JwtPayload {
    userId: Types.ObjectId | string;
    email: string;
    role: Role;
}

declare global {
  namespace Express {
    interface User extends CustomJwtPayload {}
  }
}
