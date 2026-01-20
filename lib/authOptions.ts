import { AuthOptions } from "next-auth";
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('\n=== LOGIN ATTEMPT ===');
        console.log('Email:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('ERROR: Missing credentials');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log('User found:', !!user);
          if (user) {
            console.log('User details:', {
              email: user.email,
              hasPassword: !!user.password,
              password: user.password,
              approved: user.approved,
              role: user.role
            });
          }

          if (!user) {
            console.log('ERROR: User not found');
            console.log('FIX: Run npx prisma db seed');
            return null;
          }

          if (!user.password) {
            console.log('ERROR: User has no password');
            return null;
          }

          const passwordMatch = user.password === credentials.password;
          console.log('Password match:', passwordMatch);
          console.log('Expected:', user.password);
          console.log('Received:', credentials.password);

          if (!passwordMatch) {
            console.log('ERROR: Wrong password');
            return null;
          }

          if (!user.approved) {
            console.log('ERROR: User not approved');
            return null;
          }

          console.log('SUCCESS: Login approved');
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.username || user.email,
            image: user.image || null,
            role: user.role,
          };
        } catch (error) {
          console.error('DATABASE ERROR:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
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
  secret: process.env.NEXTAUTH_SECRET || "dev-secret-change-in-production",
};
