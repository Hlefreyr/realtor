import { User, IPoint, ISavedArea, IUserSettings } from '../models/User';

// In-memory mock store for fallback testing when MongoDB is offline
const memoryUserSettings: Record<string, IUserSettings> = {
  'admin-id-123': { unit: 'kilometers', radius: 50 },
  'user-id-456': { unit: 'kilometers', radius: 50 },
};

const memoryUserAreas: Record<string, ISavedArea[]> = {
  'admin-id-123': [],
  'user-id-456': [],
};

const FALLBACK_USERS: Record<string, { pass: string; id: string; role: 'admin' | 'user' }> = {
  'admin@realtor.com': { pass: 'admin', id: 'admin-id-123', role: 'admin' },
  'user@realtor.com': { pass: 'user', id: 'user-id-456', role: 'user' },
};

export const resolvers = {
  Query: {
    hello: () => 'Hello Realtor! Welcome to your full-stack real estate platform.',
    health: () => ({
      status: 'UP',
      service: 'realtor-backend',
      timestamp: new Date().toISOString(),
    }),
    me: async (_: any, __: any, context: any) => {
      if (context && context.user) {
        return context.user;
      }

      let userId = 'user-id-456';
      let email = 'user@realtor.com';
      let role = 'user';

      if (context && context.token && context.token.includes('admin')) {
        userId = 'admin-id-123';
        email = 'admin@realtor.com';
        role = 'admin';
      }

      try {
        const dbUser = await User.findOne({ email });
        if (dbUser) {
          return {
            id: dbUser.id || (dbUser._id ? String(dbUser._id) : 'user123'),
            email: dbUser.email,
            role: dbUser.role,
            settings: dbUser.settings || { unit: 'kilometers', radius: 50 },
            savedAreas: dbUser.savedAreas || [],
          };
        }
      } catch (err) {
        // Fallback to in-memory store
      }

      return {
        id: userId,
        email,
        role,
        settings: memoryUserSettings[userId] || { unit: 'kilometers', radius: 50 },
        savedAreas: memoryUserAreas[userId] || [],
      };
    },
  },
  Mutation: {
    login: async (_: any, { email, password }: Record<string, string>) => {
      const normalizedEmail = email.trim().toLowerCase();
      try {
        const user = await User.findOne({ email: normalizedEmail });
        if (user && (await user.comparePassword(password))) {
          const userId = user.id || (user._id ? String(user._id) : 'user123');
          return {
            token: `mock-token-${userId}-${user.role}-${Date.now()}`,
            user: {
              id: userId,
              email: user.email,
              role: user.role,
              settings: user.settings || { unit: 'kilometers', radius: 50 },
              savedAreas: user.savedAreas || [],
            },
          };
        }
      } catch (dbError) {
        // Fallback for dev environment without active MongoDB connection
      }

      // Pre-seeded fallback accounts for development / testing
      const fallback = FALLBACK_USERS[normalizedEmail];
      if (fallback && fallback.pass === password) {
        return {
          token: `mock-token-${fallback.role}-${Date.now()}`,
          user: {
            id: fallback.id,
            email: normalizedEmail,
            role: fallback.role,
            settings: memoryUserSettings[fallback.id],
            savedAreas: memoryUserAreas[fallback.id],
          },
        };
      }

      throw new Error('Invalid email or password');
    },

    updateUserSettings: async (
      _: any,
      { unit, radius }: { unit: 'kilometers' | 'miles'; radius: number },
      context: any
    ) => {
      const isAdminToken = Boolean(context && context.token && context.token.includes('admin'));
      const userId = isAdminToken ? 'admin-id-123' : 'user-id-456';
      const email = isAdminToken ? 'admin@realtor.com' : 'user@realtor.com';

      const newSettings: IUserSettings = {
        unit: unit === 'miles' ? 'miles' : 'kilometers',
        radius: Number(radius) || 50,
      };

      try {
        const user = await User.findOne({ email });
        if (user) {
          user.settings = newSettings;
          await user.save();
          return user.settings;
        }
      } catch (err) {
        // Fallback
      }

      memoryUserSettings[userId] = newSettings;
      return newSettings;
    },

    saveUserArea: async (
      _: any,
      { name, polygon }: { name: String; polygon: IPoint[] },
      context: any
    ) => {
      const isAdminToken = Boolean(context && context.token && context.token.includes('admin'));
      const userId = isAdminToken ? 'admin-id-123' : 'user-id-456';
      const email = isAdminToken ? 'admin@realtor.com' : 'user@realtor.com';

      const newArea: ISavedArea = {
        id: `area-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: (name || 'Custom Search Area').toString(),
        polygon,
        createdAt: new Date(),
      };

      try {
        const user = await User.findOne({ email });
        if (user) {
          user.savedAreas.push(newArea);
          await user.save();
          return newArea;
        }
      } catch (err) {
        // Fallback
      }

      memoryUserAreas[userId] = memoryUserAreas[userId] || [];
      memoryUserAreas[userId].push(newArea);
      return newArea;
    },

    deleteUserArea: async (_: any, { id }: { id: string }, context: any) => {
      const isAdminToken = Boolean(context && context.token && context.token.includes('admin'));
      const userId = isAdminToken ? 'admin-id-123' : 'user-id-456';
      const email = isAdminToken ? 'admin@realtor.com' : 'user@realtor.com';

      try {
        const user = await User.findOne({ email });
        if (user) {
          user.savedAreas = user.savedAreas.filter((a) => a.id !== id);
          await user.save();
          return true;
        }
      } catch (err) {
        // Fallback
      }

      if (memoryUserAreas[userId]) {
        memoryUserAreas[userId] = memoryUserAreas[userId].filter((a) => a.id !== id);
      }
      return true;
    },
  },
};
