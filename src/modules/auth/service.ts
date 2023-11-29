import { Static } from "@sinclair/typebox";
import {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/libs/jwt";
import { createUser, getUserByEmail, getUserByID } from "../user/service";
import { selectUserSchema } from "@/db";

export const signUpWithPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const hashed = await Bun.password.hash(password);
  const user = await createUser(email, hashed);

  // FIXME: is there a better way to do this?
  const userWithoutPassword = omitPasswordFromUser(user);

  return userWithoutPassword;
};

export const signInWithPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const user = await getUserByEmail(email);

  const valid = await Bun.password.verify(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const payload = { id: user.id, email: user.email };
  const session = await generateTokens(payload);

  // FIXME: is there a better way to do this?
  const userWithoutPassword = omitPasswordFromUser(user);

  return { user: userWithoutPassword, session };
};

const omitPasswordFromUser = (user: Static<typeof selectUserSchema>) => {
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const getUserByAccessToken = async (access_token: string) => {
  const payload = await verifyAccessToken(access_token);
  const user = await getUserByEmail(payload.email);

  return user;
};

export const refreshSession = async (refresh_token: string) => {
  const payload = await verifyRefreshToken(refresh_token);
  const user = await getUserByID(payload.id);

  const session = await generateTokens(payload);

  return { user, session };
};
