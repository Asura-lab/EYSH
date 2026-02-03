import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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
  role: string;
}

declare module "next-auth" {
  interface Session {
    user: AuthUser;
    accessToken?: string;
    role?: string;
  }

  interface User extends AuthUser { }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
    role?: string;
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
          const formData = new URLSearchParams();
          formData.append("username", credentials.email);
          formData.append("password", credentials.password);

          // 1. Get access token
          const loginResponse = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          });

          if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            let errorMessage = "Нэвтрэх үед алдаа гарлаа";
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.detail || errorMessage;
            } catch (e) { }
            throw new Error(errorMessage);
          }

          const tokenData = await loginResponse.json();
          const accessToken = tokenData.access_token;

          if (!accessToken) return null;

          // 2. Get user details
          const userResponse = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!userResponse.ok) {
            return null;
          }

          const userData = await userResponse.json();

          return {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: userData.role,
            accessToken: accessToken,
          };
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
          await fetch(`${API_URL}/api/auth/oauth`, {
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
        // Social Login Sync
        if (account && account.provider === "google") {
          try {
            const res = await fetch(`${API_URL}/api/auth/social-login`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
                provider: account.provider
              })
            });
            if (res.ok) {
              const dbUser = await res.json();
              token.id = dbUser.id;
              token.role = dbUser.role;
              token.accessToken = dbUser.access_token;
            }
          } catch (e) {
            console.error("Social Sync Error", e);
          }
        } else {
          // Credentials Login
          token.id = user.id;
          token.role = user.role;
          token.accessToken = (user as AuthUser).accessToken;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
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
