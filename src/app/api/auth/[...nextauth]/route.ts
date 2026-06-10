import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/", // We handle login via our custom modal on the main page
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(credentials.email.toLowerCase()) as any;
        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          needsPasswordChange: user.needs_password_change === 1,
          isAdmin: user.is_admin === 1,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.needsPasswordChange = (user as any).needsPasswordChange;
        token.isAdmin = (user as any).isAdmin;
      } else if (token.email) {
        // Refresh the needsPasswordChange flag from the database on every token update if possible,
        // or just rely on the session until they re-login. We'll query DB to be safe if it's a critical forced reset.
        const dbUser = db.prepare('SELECT needs_password_change, is_admin FROM users WHERE email = ?').get(token.email) as any;
        if (dbUser) {
          token.needsPasswordChange = dbUser.needs_password_change === 1;
          token.isAdmin = dbUser.is_admin === 1;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).needsPasswordChange = token.needsPasswordChange;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
