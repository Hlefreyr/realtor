import { User } from '../models/User';

export const resolvers = {
  Query: {
    hello: () => 'Hello Realtor! Welcome to your full-stack real estate platform.',
    health: () => ({
      status: 'UP',
      service: 'realtor-backend',
      timestamp: new Date().toISOString(),
    }),
    me: async (_: any, __: any, context: any) => {
      if (context?.user) {
        return context.user;
      }
      if (!context?.token) {
        return null;
      }
      if (context.token.includes('admin')) {
        return { id: 'admin-id-123', email: 'admin@realtor.com', role: 'admin' };
      }
      return { id: 'user-id-456', email: 'user@realtor.com', role: 'user' };
    },
  },
  Mutation: {
    login: async (_: any, { email, password }: Record<string, string>) => {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await user.comparePassword(password))) {
          const userId = user.id || user._id?.toString() || 'user123';
          return {
            token: `mock-token-${userId}-${user.role}-${Date.now()}`,
            user: {
              id: userId,
              email: user.email,
              role: user.role,
            },
          };
        }
      } catch (dbError) {
        // Fallback for dev environment without active MongoDB connection
      }

      // Pre-seeded fallback accounts for development / testing when DB is unseeded or missing
      if (normalizedEmail === 'admin@realtor.com' && password === 'admin') {
        return {
          token: `mock-token-admin-${Date.now()}`,
          user: { id: 'admin-id-123', email: 'admin@realtor.com', role: 'admin' },
        };
      }
      if (normalizedEmail === 'user@realtor.com' && password === 'user') {
        return {
          token: `mock-token-user-${Date.now()}`,
          user: { id: 'user-id-456', email: 'user@realtor.com', role: 'user' },
        };
      }

      throw new Error('Invalid email or password');
    },
  },
};
