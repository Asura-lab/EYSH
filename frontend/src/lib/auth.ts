import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// TypeScript Interfaces
interface UserCredentials {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  accessToken?: string;
}

declare module "next-auth" {
  interface Session {
    user: AuthUser;
    accessToken?: string;
  }
  
  interface User extends AuthUser {}
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    
    // Email/Password Credentials Provider
    CredentialsProvider({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "example@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthUser | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("И-мэйл болон нууц үг оруулна уу");
        }

        try {
          const response = await fetch(`${BACKEND_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || "Нэвтрэх үед алдаа гарлаа");
          }

          const { user, token } = await response.json();

          if (user && token) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              accessToken: token,
            };
          }

          return null;
        } catch (error: any) {
          throw new Error(error.message || "Нэвтрэх үед алдаа гарлаа");
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
    newUser: "/dashboard",
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // Google-ээр нэвтэрсэн үед backend-д бүртгэх
      if (account?.provider === "google" && profile?.email) {
        try {
          await fetch(`${BACKEND_URL}/auth/oauth`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: "google",
              email: profile.email,
              name: user.name,
              image: user.image,
              providerId: account.providerAccountId,
            }),
          });
        } catch (error) {
          console.error("OAuth registration error:", error);
        }
      }
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.accessToken = (user as AuthUser).accessToken;
      }
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};
