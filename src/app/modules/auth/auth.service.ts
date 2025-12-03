import { UserRole, UserStatus } from "@prisma/client";
import { prisma } from "../../config/db";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { envVars } from "../../config/env";
import { JwtHelper } from "../../helper/jwtHelper";

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isPasswordCorrect = await bcryptjs.compare(
    payload.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Password is incorrect");
  }

  interface MyTokenPayload {
    email: string;
    role: UserRole; // Better than plain string if using Prisma enums
  }

  const jwtPayload: MyTokenPayload = {
    email: user.email,
    role: user.role,
  };
  const accessToken = JwtHelper.generateToken(
    jwtPayload,
    envVars.JWT.ACCESS_TOKEN_SECRETS,
    envVars.JWT.ACCESS_TOKEN_EXPIRES
  );
  const refreshToken = JwtHelper.generateToken(
    jwtPayload,
    envVars.JWT.REFRESH_TOKEN_SECRETS,
    envVars.JWT.REFRESH_TOKEN_EXPIRES
  );

  return {
    accessToken,
    refreshToken,
    needPasswordChange: user.needPasswordChange,
  };
};

export const AuthService = {
  login,
};
