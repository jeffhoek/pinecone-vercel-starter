import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import crypto from "crypto";

function timingSafeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Always run the comparison to avoid leaking length via timing
  const ref = bufA.length === bufB.length ? bufB : bufA;
  const match = crypto.timingSafeEqual(bufA, ref);
  return bufA.length === bufB.length && match;
}

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APP_PASSWORD) {
  providers.push(
    CredentialsProvider({
      name: "Passphrase",
      credentials: {
        password: { label: "Passphrase", type: "password" },
      },
      async authorize(credentials) {
        const appPassword = process.env.APP_PASSWORD;
        if (!appPassword || !credentials?.password) return null;
        if (timingSafeCompare(credentials.password, appPassword)) {
          return { id: "local", name: "Local User" };
        }
        return null;
      },
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      // Email whitelist only applies to Google OAuth
      if (account?.provider === "google") {
        const allowedEmails = process.env.ALLOWED_EMAILS?.split(",") || [];
        if (allowedEmails.length > 0 && user.email) {
          return allowedEmails.includes(user.email);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || "";
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
