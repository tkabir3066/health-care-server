import jwt, { JwtPayload, Secret, SignOptions } from "jsonwebtoken";

const generateToken = (
  payload: JwtPayload,
  secret: Secret,
  expiresIn: string
) => {
  const token = jwt.sign(payload, secret, {
    algorithm: "HS256",
    expiresIn: expiresIn,
  } as SignOptions);

  return token;
};

const verifyToken = (token: string, secret: string) => {
  const verifiedToken = jwt.verify(token, secret);

  return verifiedToken;
};
export const JwtHelper = {
  generateToken,
  verifyToken,
};
