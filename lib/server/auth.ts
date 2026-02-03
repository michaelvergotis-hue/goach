import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type AuthInfo = {
  userId: string;
  isAdmin: boolean;
};

export async function getAuthInfo(): Promise<AuthInfo | null> {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { friendId?: unknown } | undefined)?.friendId;
  if (!userId || typeof userId !== "string") return null;

  const isAdmin = Boolean(
    (session?.user as { isAdmin?: unknown } | undefined)?.isAdmin
  );
  return { userId, isAdmin };
}

