import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

  if (token == null) {
    return res.status(401).json({ message: "Authentication token required." });
  }

  try {
    const decodedPayload = AuthService.verifyToken(token);
    if (
      typeof decodedPayload === "string" ||
      !decodedPayload.id ||
      !decodedPayload.email ||
      !decodedPayload.role
    ) {
      return res.status(403).json({ message: "Invalid token payload format." });
    }
    req.user = {
      id: decodedPayload.id,
      email: decodedPayload.email,
      role: decodedPayload.role,
    };
    next();
  } catch (error: any) {
    console.error("Auth Middleware Error:", error.message, error); // Log full error
    return res
      .status(403)
      .json({ message: "Forbidden: Invalid or expired token." });
  }
};
