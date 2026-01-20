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

// Check if Google OAuth is properly configured
const isGoogleConfigured = Boolean(
  process.env.GOOGLE_CLIENT_ID && 
  process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== "dummy-id" &&
  process.env.GOOGLE_CLIENT_SECRET !== "dummy-secret"
);

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 NextAuth Configuration');
console.log('   Google OAuth:', isGoogleConfigured ? '✅ Enabled' : '⚠️  Disabled (credentials missing)');
console.log('   Credentials Login: ✅ Enabled');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

export const authOptions: AuthOptions = {
  providers: [
    // Credentials Provider (always enabled)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔐 CREDENTIALS LOGIN ATTEMPT');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Missing email or password');
            console.log('   Email provided:', !!credentials?.email);
            console.log('   Password provided:', !!credentials?.password);
            return null;
          }

          console.log('📧 Login attempt for email:', credentials.email);
          console.log('🔍 Searching database...');

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log('❌ USER NOT FOUND in database');
            console.log('');
            console.log('🔧 TO FIX: Run these commands:');
            console.log('   1. npx prisma db push');
            console.log('   2. npx prisma db seed');
            console.log('   3. npm run test:db');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return null;
          }

          console.log('✅ User found in database!');
          console.log('   Email:', user.email);
          console.log('   Has password:', !!user.password);
          console.log('   Approved:', user.approved);
          console.log('   Role:', user.role);
          console.log('   Provider:', user.provider);

          if (!user.password) {
            console.log('❌ This user has no password (Google-only account)');
            console.log('   Use Google Sign-In for this email');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return null;
          }

          console.log('🔑 Checking password...');
          if (user.password !== credentials.password) {
            console.log('❌ PASSWORD INCORRECT');
            console.log('   Expected password:', user.password);
            console.log('   Provided password:', credentials.password);
            console.log('   Match:', user.password === credentials.password);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return null;
          }

          console.log('✅ Password correct!');

          if (!user.approved) {
            console.log('❌ User not approved');
            console.log('   Admin needs to approve this user');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return null;
          }

          console.log('✅ User is approved!');
          console.log('✅ LOGIN SUCCESSFUL!');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name || user.username || user.email,
            image: user.image || null,
            role: user.role,
          };
        } catch (error) {
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('💥 DATABASE ERROR:');
          console.error(error);
          console.error('');
          console.error('🔧 TO FIX:');
          console.error('   1. Check DATABASE_URL in .env.local');
          console.error('   2. Make sure database is running');
          console.error('   3. Run: npx prisma db push');
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return null;
        }
      },
    }),
    
    // Google Provider (only if configured)
    ...(isGoogleConfigured ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    ] : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔑 SignIn Callback');
        console.log('Provider:', account?.provider);
        console.log('User email:', user.email);

        // Allow credentials login
        if (account?.provider === "credentials") {
          console.log('✅ Credentials provider - allowing sign in');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return true;
        }

        // Handle Google login
        if (account?.provider === "google") {
          console.log('🔍 Google login - checking existing user...');
          
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
          });

          // If user exists and is approved, allow login
          if (existingUser && existingUser.approved) {
            console.log('✅ Existing approved user - allowing Google login');
            
            // Update user info from Google
            await prisma.user.update({
              where: { email: user.email! },
              data: {
                name: user.name || existingUser.name,
                image: user.image || existingUser.image,
                provider: 'google',
              }
            });
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return true;
          }

          // If user exists but not approved
          if (existingUser && !existingUser.approved) {
            console.log('❌ User exists but not approved');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
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
          }

          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          return '/login?error=signup_requested';
        }

        return true;
      } catch (error) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('💥 SignIn callback error:', error);
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return '/login?error=server_error';
      }
    },
    async jwt({ token, user }) {
      try {
        if (user) {
          const extendedUser = user as ExtendedUser;
          token.id = extendedUser.id;
          token.role = extendedUser.role;
          token.email = extendedUser.email;
          token.name = extendedUser.name;
          token.image = extendedUser.image;
        }
        
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
    maxAge: 30 * 24 * 60 * 60,
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET || "development-secret-change-in-production",
};
