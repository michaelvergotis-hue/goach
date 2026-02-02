import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      friendId?: string;
      isAdmin?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    friendId?: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    friendId?: string;
    isAdmin?: boolean;
  }
}
