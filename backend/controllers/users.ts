import { z } from "zod";
import { logger } from "../logger/logger";
import { signupSchema } from "../schema/user.schema";
import {
  createUser,
  deleteUser,
  DuplicateEmailError,
  listUsers,
} from "../lib/user.service";
import { getAuthContext } from "../lib/auth";

function sanitize(user: { id: string; email: string; createdAt: string }) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

export async function listUsersController(): Promise<Response> {
  try {
    const users = await listUsers();

    return Response.json({ users: users.map(sanitize) });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to list users",
    );

    return Response.json({ message: "Failed to list users" }, { status: 500 });
  }
}

export async function createUserController(req: Request): Promise<Response> {
  try {
    const body = signupSchema.parse(await req.json());

    const passwordHash = await Bun.password.hash(body.password, {
      algorithm: "argon2id",
      memoryCost: 19456,
      timeCost: 2,
    });

    const user = await createUser(body.email, passwordHash);

    return Response.json({ user: sanitize(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(error.flatten(), { status: 400 });
    }

    if (error instanceof DuplicateEmailError) {
      return Response.json({ message: error.message }, { status: 409 });
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to create user",
    );

    return Response.json({ message: "Failed to create user" }, { status: 500 });
  }
}

export async function deleteUserController(req: Request): Promise<Response> {
  const ctx = getAuthContext(req);
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return Response.json({ message: "User id is required" }, { status: 400 });
  }

  if (ctx && ctx.session.userId === id) {
    return Response.json(
      { message: "You cannot remove your own account" },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteUser(id);

    if (!deleted) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }

    return Response.json({ message: "User removed" });
  } catch (error) {
    logger.error(
      { userId: id, error: error instanceof Error ? error.message : String(error) },
      "Failed to delete user",
    );

    return Response.json({ message: "Failed to delete user" }, { status: 500 });
  }
}
