import { z } from "zod";
import { logger } from "../logger/logger";
import { signupSchema, loginSchema } from "../schema/user.schema";
import {
  findUserByEmail,
  createUser,
  createSession,
  deleteSession,
  DuplicateEmailError,
} from "../lib/user.service";
import { getAuthContext } from "../lib/auth";

export async function signupController(req: Request): Promise<Response> {
  try {
    const body = signupSchema.parse(await req.json());

    const passwordHash = await Bun.password.hash(body.password, {
      algorithm: "argon2id",
      memoryCost: 19456,
      timeCost: 2,
    });

    const user = await createUser(body.email, passwordHash);

    const token = await createSession(user.id, user.email);

    return Response.json(
      {
        user: {
          id: user.id,
          email: user.email,
          createdAt: user.createdAt,
        },
        token,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(error.flatten(), { status: 400 });
    }

    if (error instanceof DuplicateEmailError) {
      return Response.json({ message: error.message }, { status: 409 });
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to sign up user",
    );

    return Response.json(
      { message: "Failed to create account" },
      { status: 500 },
    );
  }
}

export async function loginController(req: Request): Promise<Response> {
  try {
    const body = loginSchema.parse(await req.json());

    const user = await findUserByEmail(body.email);

    if (!user) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const valid = await Bun.password.verify(body.password, user.passwordHash);

    if (!valid) {
      return Response.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = await createSession(user.id, user.email);

    return Response.json({
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(error.flatten(), { status: 400 });
    }

    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to log in user",
    );

    return Response.json({ message: "Failed to log in" }, { status: 500 });
  }
}

export async function logoutController(req: Request): Promise<Response> {
  const ctx = getAuthContext(req);
  if (!ctx) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteSession(ctx.token);

    logger.info({ userId: ctx.session.userId }, "User logged out");

    return Response.json({ message: "Logged out" });
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : String(error) },
      "Failed to log out user",
    );

    return Response.json({ message: "Failed to log out" }, { status: 500 });
  }
}
