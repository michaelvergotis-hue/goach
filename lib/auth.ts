import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { friends } from "./friends";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check if user's email matches any friend in the system
      const email = user.email?.toLowerCase();
      if (!email) return false;

      // Find friend by email
      const friend = friends.find(f => f.email?.toLowerCase() === email);
      if (friend) {
        return true;
      }

      // For now, allow all Google sign-ins but they won't be linked to a profile
      // They can still use the app but will need to select a profile
      return true;
    },
    async session({ session, token }) {
      // Add user email to session for profile matching
      if (session.user && token.email) {
        const friend = friends.find(f => f.email?.toLowerCase() === token.email?.toLowerCase());
        if (friend) {
          (session.user as Record<string, unknown>).friendId = friend.id;
          (session.user as Record<string, unknown>).isAdmin = friend.isAdmin;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
