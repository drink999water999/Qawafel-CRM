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

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('\n=== CREDENTIALS LOGIN ===');
        console.log('Email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('User not found');
            return null;
          }

          if (!user.password || user.password !== credentials.password) {
            console.log('Wrong password');
            return null;
          }

          if (!user.approved) {
            console.log('User not approved');
            return null;
          }

          console.log('Login successful');
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.username || user.email,
            image: user.image || null,
            role: user.role,
          };
        } catch (error) {
          console.error('Database error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") {
        return true;
      }

      if (account?.provider === "google") {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email! },
        });

        if (existingUser && existingUser.approved) {
          await prisma.user.update({
            where: { email: user.email! },
            data: {
              name: user.name || existingUser.name,
              image: user.image || existingUser.image,
              provider: 'google',
            }
          });
          return true;
        }

        if (existingUser && !existingUser.approved) {
          return '/login?error=pending';
        }

        const existingRequest = await prisma.signupRequest.findUnique({
          where: { email: user.email! },
        });

        if (!existingRequest) {
          await prisma.signupRequest.create({
            data: {
              email: user.email!,
              name: user.name || user.email!,
              image: user.image,
              provider: "google",
              status: "pending",
            },
          });
        }

        return '/login?error=signup_requested';
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as ExtendedUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const extendedSession = session as { user: { id?: string; role?: string; name?: string | null; email?: string | null; image?: string | null } };
        extendedSession.user.id = token.id as string;
        extendedSession.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
