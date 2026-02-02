import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isEmailWhitelisted, getFriendByEmail } from "./friends";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;

      // Only allow whitelisted emails
      if (!isEmailWhitelisted(email)) {
        return false;
      }

      return true;
    },
    async jwt({ token, user }) {
      // On initial sign in, add friend data to token
      if (user?.email) {
        const friend = getFriendByEmail(user.email);
        if (friend) {
          token.friendId = friend.id;
          token.isAdmin = friend.isAdmin || false;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Add friend data to session
      if (session.user) {
        (session.user as Record<string, unknown>).friendId = token.friendId;
        (session.user as Record<string, unknown>).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
