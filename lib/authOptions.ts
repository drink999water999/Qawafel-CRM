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
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials');
            return null;
          }

          console.log('Attempting login for:', credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log('User found:', user ? 'Yes' : 'No');

          if (!user) {
            console.log('User not found');
            return null;
          }

          if (user.password !== credentials.password) {
            console.log('Password mismatch');
            return null;
          }

          if (!user.approved) {
            console.log('User not approved');
            throw new Error("Your account is pending approval");
          }

          console.log('Login successful for:', credentials.email);

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.username || "",
            image: user.image || null,
            role: user.role,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log('SignIn callback - Provider:', account?.provider);
        console.log('SignIn callback - User email:', user.email);

        if (account?.provider === "google") {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          console.log('Existing Google user found:', existingUser ? 'Yes' : 'No');

          if (existingUser) {
            if (!existingUser.approved) {
              console.log('User exists but not approved');
              throw new Error("pending");
            }
            console.log('Existing Google user approved, allowing sign in');
            return true;
          }

          // Check if signup request exists
          const existingRequest = await prisma.signupRequest.findUnique({
            where: { email: user.email! },
          });

          console.log('Existing signup request:', existingRequest ? 'Yes' : 'No');

          if (!existingRequest) {
            // Create signup request
            console.log('Creating new signup request for:', user.email);
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
      } catch (error) {
        console.error('SignIn callback error:', error);
        throw error;
      }
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
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};
