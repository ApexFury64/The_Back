import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Try to find by email
        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // Fallback to finding by phone if email check yields nothing
        if (!user) {
          user = await prisma.user.findFirst({
            where: { phone: credentials.email },
          });
        }

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.schoolId = (user as any).schoolId;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).schoolId = token.schoolId;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  secret: process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET,
};

import { getServerSession } from "next-auth/next";
export async function getSession() {
  const session = await getServerSession(authOptions);
  return session?.user as any || null;
}
