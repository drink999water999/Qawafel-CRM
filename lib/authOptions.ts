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
      clientId: process.env.GOOGLE_CLIENT_ID || "dummy-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "dummy-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('🔐 Credentials Login Attempt');
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing email or password');
            return null;
          }

          console.log('📧 Email:', credentials.email);

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('❌ User not found in database');
            return null;
          }

          console.log('✅ User found:', {
            email: user.email,
            hasPassword: !!user.password,
            approved: user.approved,
            role: user.role
          });

          if (!user.password) {
            console.log('❌ User has no password (Google user)');
            return null;
          }

          if (user.password !== credentials.password) {
            console.log('❌ Password incorrect');
            return null;
          }

          if (!user.approved) {
            console.log('❌ User not approved');
            return null;
          }

          console.log('✅ Login successful!');

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.username || user.email,
            image: user.image || null,
            role: user.role,
          };
        } catch (error) {
          console.error('💥 Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log('🔑 SignIn Callback');
        console.log('Provider:', account?.provider);
        console.log('User email:', user.email);

        // Allow credentials login
        if (account?.provider === "credentials") {
          console.log('✅ Credentials login - allowing');
          return true;
        }

        // Handle Google login
        if (account?.provider === "google") {
          console.log('🔍 Checking for existing user...');
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user exists and is approved, allow login
          if (existingUser && existingUser.approved) {
            console.log('✅ Existing approved user - allowing Google login');
            
            // Update user info from Google if needed
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                provider: 'google', // Update provider to google
              }
            });
            
            return true;
          }

          // If user exists but not approved
          if (existingUser && !existingUser.approved) {
            console.log('❌ User exists but not approved');
            return '/login?error=pending';
          }

          // New user - create signup request
          console.log('📝 New user - creating signup request');
          
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
            console.log('✅ Signup request created');
          } else {
            console.log('ℹ️  Signup request already exists');
          }

          return '/login?error=signup_requested';
        }

        return true;
      } catch (error) {
        console.error('💥 SignIn callback error:', error);
        return '/login?error=server_error';
      }
    },
    async jwt({ token, user }) {
      try {
        // Initial sign in
        if (user) {
          const extendedUser = user as ExtendedUser;
          token.id = extendedUser.id;
          token.role = extendedUser.role;
          token.email = extendedUser.email;
          token.name = extendedUser.name;
          token.image = extendedUser.image;
        }
        
        // Refresh user data from database on each request
        if (token.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { 
              id: true,
              role: true, 
              approved: true, 
              name: true, 
              image: true,
              email: true 
            },
          });
          
          if (dbUser) {
            token.id = dbUser.id.toString();
            token.role = dbUser.role;
            token.approved = dbUser.approved;
            token.name = dbUser.name;
            token.image = dbUser.image;
          }
        }
        
        return token;
      } catch (error) {
        console.error('💥 JWT callback error:', error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        const extendedToken = token as ExtendedToken;
        const extendedSession = session as ExtendedSession;
        
        if (extendedSession.user) {
          extendedSession.user.id = extendedToken.id;
          extendedSession.user.role = extendedToken.role;
          extendedSession.user.approved = extendedToken.approved;
          extendedSession.user.name = extendedToken.name as string;
          extendedSession.user.email = extendedToken.email as string;
          extendedSession.user.image = extendedToken.image as string;
        }
        
        return session;
      } catch (error) {
        console.error('💥 Session callback error:', error);
        return session;
      }
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};
