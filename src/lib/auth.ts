import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Optional: Add email whitelist here
      // const allowedEmails = process.env.ALLOWED_EMAILS?.split(',') || [];
      // if (allowedEmails.length > 0 && user.email) {
      //   return allowedEmails.includes(user.email);
      // }
      return true; // Allow all Google users
    },
    async session({ session, token }) {
      // Add user ID to session if needed
      if (session.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
