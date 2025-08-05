import { ZodObject, ZodRawShape } from "zod";
import { Request, Response, NextFunction } from "express";

// Custom AnyZodObject type
type AnyZodObject = ZodObject<ZodRawShape>;

export const validateRequest = (schema: AnyZodObject) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("📥 Request body before validation:", req.body);
    req.body = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    console.error("❌ Zod validation failed", error);
    next(error);
  }
};
