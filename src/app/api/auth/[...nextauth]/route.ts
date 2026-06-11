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

        // If name is null, default to email prefix
        const name = user.name || user.email.split('@')[0];
        
        // Update last_login
        const now = new Date().toISOString();
        db.prepare('UPDATE users SET last_login = ? WHERE email = ?').run(now, user.email);

        return {
          id: user.id,
          email: user.email,
          name: name,
          lastLogin: now,
          needsPasswordChange: user.needs_password_change === 1,
          isAdmin: user.is_admin === 1,
          isSuperAdmin: user.is_superadmin === 1,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.lastLogin = (user as any).lastLogin;
        token.needsPasswordChange = (user as any).needsPasswordChange;
        token.isAdmin = (user as any).isAdmin;
        token.isSuperAdmin = (user as any).isSuperAdmin;
      } else if (token.email) {
        const dbUser = db.prepare('SELECT needs_password_change, is_admin, is_superadmin, name, last_login FROM users WHERE email = ?').get(token.email) as any;
        if (dbUser) {
          token.needsPasswordChange = dbUser.needs_password_change === 1;
          token.isAdmin = dbUser.is_admin === 1;
          token.isSuperAdmin = dbUser.is_superadmin === 1;
          token.name = dbUser.name || token.email.split('@')[0];
          token.lastLogin = dbUser.last_login;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).name = token.name;
        (session.user as any).lastLogin = token.lastLogin;
        (session.user as any).needsPasswordChange = token.needsPasswordChange;
        (session.user as any).isAdmin = token.isAdmin;
        (session.user as any).isSuperAdmin = token.isSuperAdmin;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev_only",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
