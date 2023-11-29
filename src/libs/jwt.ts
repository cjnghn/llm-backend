import { env } from "@/env";
import jwt, { JwtPayload as BaseJwtPayload } from "jsonwebtoken";

interface JwtPayload extends BaseJwtPayload {
  id: number;
  email: string;
}

export const signAccessToken = async (payload: JwtPayload): Promise<string> => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyAccessToken = async (token: string): Promise<JwtPayload> => {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
};

export const signRefreshToken = async (
  payload: JwtPayload
): Promise<string> => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });
};

export const verifyRefreshToken = async (
  token: string
): Promise<JwtPayload> => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;
};

export const generateTokens = async (payload: JwtPayload) => {
  const data = await Promise.all([
    signAccessToken(payload),
    signRefreshToken(payload),
  ]);

  return { access_token: data[0], refresh_token: data[1] };
};
