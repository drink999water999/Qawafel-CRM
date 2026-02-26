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
        console.log('\n========================================');
        console.log('🔐 AUTHORIZE CALLED');
        console.log('Email:', credentials?.email);
        console.log('Password provided:', !!credentials?.password);
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ FAILED: Missing credentials');
          console.log('========================================\n');
          return null;
        }

        try {
          console.log('📊 Querying database...');
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          console.log('User found:', !!user);
          if (user) {
            console.log('User details:', {
              id: user.id,
              email: user.email,
              hasPassword: !!user.password,
              password: user.password,
              approved: user.approved,
              role: user.role,
              provider: user.provider
            });
          }

          if (!user) {
            console.log('❌ FAILED: User not found');
            console.log('========================================\n');
            return null;
          }

          if (!user.password) {
            console.log('❌ FAILED: User has no password');
            console.log('========================================\n');
            return null;
          }

          console.log('Comparing passwords:');
          console.log('  Database:', user.password);
          console.log('  Provided:', credentials.password);
          console.log('  Match:', user.password === credentials.password);

          if (user.password !== credentials.password) {
            console.log('❌ FAILED: Wrong password');
            console.log('========================================\n');
            return null;
          }

          if (!user.approved) {
            console.log('❌ FAILED: User not approved');
            console.log('========================================\n');
            return null;
          }

          const returnUser = {
            id: user.id,
            email: user.email,
            name: user.name || user.username || user.email,
            image: user.image || null,
            role: user.role,
          };

          console.log('✅ SUCCESS: Returning user:', returnUser);
          console.log('========================================\n');
          return returnUser;
        } catch (error) {
          console.error('❌ DATABASE ERROR:', error);
          console.log('========================================\n');
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      console.log('\n========================================');
      console.log('🔑 SIGNIN CALLBACK');
      console.log('Provider:', account?.provider);
      console.log('User:', user?.email);
      
      try {
        if (account?.provider === "credentials") {
          console.log('✅ Allowing credentials sign in');
          console.log('========================================\n');
          return true;
        }

        if (account?.provider === "google") {
          console.log('🔍 Checking Google user...');
          
          if (!user.email) {
            console.log('❌ No email provided');
            console.log('========================================\n');
            return '/login?error=no_email';
          }

          try {
            const existingUser = await prisma.user.findUnique({
              where: { email: user.email },
            });

            if (existingUser && existingUser.approved) {
              console.log('✅ Existing approved Google user');
              await prisma.user.update({
                where: { email: user.email },
                data: {
                  name: user.name || existingUser.name,
                  image: user.image || existingUser.image,
                  provider: 'google',
                }
              });
              console.log('========================================\n');
              return true;
            }

            if (existingUser && !existingUser.approved) {
              console.log('❌ User not approved');
              console.log('========================================\n');
              return '/login?error=pending';
            }

            console.log('📝 Creating signup request');
            const existingRequest = await prisma.signupRequest.findUnique({
              where: { email: user.email },
            });

            if (!existingRequest) {
              await prisma.signupRequest.create({
                data: {
                  email: user.email,
                  name: user.name || user.email,
                  image: user.image,
                  provider: "google",
                  status: "pending",
                },
              });
            }
            console.log('========================================\n');
            return '/login?error=signup_requested';
          } catch (dbError) {
            console.error('❌ Database error in Google sign-in:', dbError);
            console.log('========================================\n');
            return '/login?error=database_error';
          }
        }

        console.log('========================================\n');
        return true;
      } catch (error) {
        console.error('❌ Error in signIn callback:', error);
        console.log('========================================\n');
        return '/login?error=auth_error';
      }
    },
    async jwt({ token, user }) {
      console.log('\n========================================');
      console.log('🎫 JWT CALLBACK');
      
      if (user) {
        console.log('User from auth:', user.id, user.email);
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = (user as ExtendedUser).role;
      }
      
      // Always fetch fresh role from database
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true, approved: true }
          });
          
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.approved = dbUser.approved;
            console.log('Fetched from DB - Role:', dbUser.role, 'Approved:', dbUser.approved);
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      }
      
      console.log('Final token:', { id: token.id, role: token.role, email: token.email });
      console.log('========================================\n');
      return token;
    },
    async session({ session, token }) {
      console.log('\n========================================');
      console.log('📋 SESSION CALLBACK');
      const extendedToken = token as ExtendedToken;
      console.log('Token data:', { id: extendedToken.id, role: extendedToken.role, approved: extendedToken.approved });
      
      if (session.user) {
        const extendedSession = session as { user: { id?: string; role?: string; approved?: boolean; name?: string | null; email?: string | null; image?: string | null } };
        extendedSession.user.id = extendedToken.id as string;
        extendedSession.user.role = extendedToken.role as string;
        extendedSession.user.approved = extendedToken.approved;
        console.log('Session user:', extendedSession.user);
      }
      console.log('========================================\n');
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
