import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { JWT_SECRET } from "@config/secrets";

type TokenPayload = {
  accountId: string;
  sessionId: string;
};

export const signToken = (payload: TokenPayload, options?: SignOptions) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: "1y",
  });
};

export const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (err) {
    return false;
  }
};
