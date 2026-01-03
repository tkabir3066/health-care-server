import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../shared/jwt";
import { envVars } from "../config/env";
import { JwtPayload } from "jsonwebtoken";
import { IJWTPayload } from "../types/common";
import ApiError from "../errors/ApiError";
import { StatusCodes } from "http-status-codes";

export const auth =
  (...roles: string[]) =>
  async (req: Request & { user?: any }, res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;

      if (!token) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not Authorized");
      }

      const verifiedUser = verifyToken(
        token,
        envVars.JWT.ACCESS_TOKEN_SECRETS
      ) as JwtPayload;

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "You are not Authorized");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
