import { NotFoundError } from "elysia";
import { db, user, eq } from "@/db";

export const getUserByID = async (id: number) => {
  const result = await db.select().from(user).where(eq(user.id, id));
  if (result[0]) return result[0];

  throw new NotFoundError("A user with this id does not exist");
};

export const getUserByEmail = async (email: string) => {
  const result = await db.select().from(user).where(eq(user.email, email));
  if (result[0]) return result[0];

  throw new NotFoundError("A user with this email does not exist");
};

export const checkIfUserExists = async (email: string) => {
  const result = await db.select().from(user).where(eq(user.email, email));

  return !!result[0];
};

export const createUser = async (email: string, password: string) => {
  // Check if user already exists
  if (await checkIfUserExists(email)) throw new Error("User already exists");

  const result = await db.insert(user).values({ email, password }).returning();

  return result[0];
};
