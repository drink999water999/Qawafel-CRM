import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";

interface ExtendedUser {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  role: string;
}

interface ExtendedToken {
  id?: string;
  role?: string;
  approved?: boolean;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    id?: string;
    role?: string;
    approved?: boolean;
  };
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || user.password !== credentials.password) {
          return null;
        }

        if (!user.approved) {
          throw new Error("Your account is pending approval");
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name || user.username || "",
          image: user.image || null,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser) {
          if (!existingUser.approved) {
            throw new Error("pending");
          }
          return true;
        }

        // Check if signup request exists
        const existingRequest = await prisma.signupRequest.findUnique({
          where: { email: user.email! },
        });

        if (!existingRequest) {
          // Create signup request
          await prisma.signupRequest.create({
            data: {
              email: user.email!,
              name: user.name!,
              image: user.image,
              provider: "google",
              status: "pending",
            },
          });
        }

        throw new Error("signup_requested");
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.role = extendedUser.role;
        token.id = extendedUser.id;
      }
      
      // Fetch latest user data on each request
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { role: true, approved: true, name: true, image: true, id: true },
        });
        
        if (dbUser) {
          token.role = dbUser.role;
          token.approved = dbUser.approved;
          token.name = dbUser.name;
          token.image = dbUser.image;
          token.id = dbUser.id.toString();
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      const extendedToken = token as ExtendedToken;
      const extendedSession = session as ExtendedSession;
      
      if (extendedSession.user) {
        extendedSession.user.role = extendedToken.role;
        extendedSession.user.id = extendedToken.id;
        extendedSession.user.approved = extendedToken.approved;
        extendedSession.user.name = extendedToken.name as string;
        extendedSession.user.image = extendedToken.image as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
