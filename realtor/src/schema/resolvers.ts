import { GraphQLError } from 'graphql';
import { User, IPoint, ISavedArea, IUserSettings, ISearchCriteria } from '../models/User';
import { Areas, IAreas } from '../models/Areas';
import { RealEstateProviderFactory, DEFAULT_SAMPLE_PROPERTIES } from '../services/RealEstateProvider';
import { IPropertyListing } from '../models/PropertyData';

export interface AuthContextUser {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

export const isProductionEnv = (): boolean => {
  return process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';
};

export const requireAuth = (context: any): AuthContextUser => {
  if (context && context.user) {
    return context.user;
  }

  const rawToken = context?.token || '';
  const token = typeof rawToken === 'string' ? rawToken.replace(/^Bearer\s+/i, '').trim() : '';

  if (!token) {
    if (isProductionEnv()) {
      throw new GraphQLError('Authentication required. Please log in.', {
        extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
      });
    }
    return {
      userId: 'user-id-456',
      email: 'user@realtor.com',
      role: 'user',
    };
  }

  const isAdmin = token.includes('admin');
  return {
    userId: isAdmin ? 'admin-id-123' : 'user-id-456',
    email: isAdmin ? 'admin@realtor.com' : 'user@realtor.com',
    role: isAdmin ? 'admin' : 'user',
  };
};

export const requireAdmin = (context: any): AuthContextUser => {
  const user = requireAuth(context);
  if (user.role !== 'admin' && isProductionEnv()) {
    throw new GraphQLError('Admin access required.', {
      extensions: { code: 'FORBIDDEN', http: { status: 403 } },
    });
  }
  return user;
};

const DEFAULT_SEARCH_CRITERIA: ISearchCriteria = {
  statusType: 'ForSale',
  homeTypes: ['Houses', 'Condos'],
  priceMin: 0,
  priceMax: 2000000,
  bedsMin: 1,
  bedsMax: 10,
  bathsMin: 1,
  bathsMax: 10,
  sqftMin: 0,
  sqftMax: 10000,
  yearBuiltMin: 1900,
  yearBuiltMax: 2026,
  daysOnMarket: 90,
};

const memoryUserSettings: Record<string, IUserSettings> = {
  'admin-id-123': { unit: 'kilometers', radius: 50, searchCriteria: DEFAULT_SEARCH_CRITERIA },
  'user-id-456': { unit: 'kilometers', radius: 50, searchCriteria: DEFAULT_SEARCH_CRITERIA },
};

const memoryUserAreas: Record<string, ISavedArea[]> = {
  'admin-id-123': [],
  'user-id-456': [],
};

const FALLBACK_USERS: Record<string, { pass: string; id: string; role: 'admin' | 'user' }> = {
  'admin@realtor.com': { pass: 'admin', id: 'admin-id-123', role: 'admin' },
  'user@realtor.com': { pass: 'user', id: 'user-id-456', role: 'user' },
};

function formatSavedArea(area: any): any {
  if (!area) return null;
  const plain = typeof area.toObject === 'function' ? area.toObject() : area;
  return {
    id: plain.id,
    name: plain.name,
    polygon: plain.polygon || [],
    properties: plain.properties || [],
    candidateProperties: plain.candidateProperties || plain.preCandidateProperties || [],
    preCandidateProperties: plain.candidateProperties || plain.preCandidateProperties || [],
    createdAt: plain.createdAt,
  };
}

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
      const authUser = requireAuth(context);
      const userId = authUser.userId;
      const email = authUser.email;
      const role = authUser.role;

      try {
        const dbUser = await User.findOne({ email });
        const dbAreas = await Areas.find({ userId: email });

        if (dbUser) {
          const userSavedAreas = dbAreas.length > 0 ? dbAreas : dbUser.savedAreas || [];
          return {
            id: dbUser.id || (dbUser._id ? String(dbUser._id) : 'user123'),
            email: dbUser.email,
            role: dbUser.role,
            settings: dbUser.settings || { unit: 'kilometers', radius: 50 },
            savedAreas: userSavedAreas.map(formatSavedArea),
          };
        }
      } catch (err) {
        // Fallback to in-memory store
      }

      const memAreas = memoryUserAreas[userId] || [];
      return {
        id: userId,
        email,
        role,
        settings: memoryUserSettings[userId] || {
          unit: 'kilometers',
          radius: 50,
          searchCriteria: DEFAULT_SEARCH_CRITERIA,
        },
        savedAreas: memAreas.map(formatSavedArea),
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
          const dbAreas = await Areas.find({ userId: normalizedEmail });
          const userSavedAreas = dbAreas.length > 0 ? dbAreas : user.savedAreas || [];

          return {
            token: `mock-token-${userId}-${user.role}-${Date.now()}`,
            user: {
              id: userId,
              email: user.email,
              role: user.role,
              settings: user.settings || { unit: 'kilometers', radius: 50 },
              savedAreas: userSavedAreas.map(formatSavedArea),
            },
          };
        }
      } catch (dbError) {
        // Fallback for dev environment
      }

      const fallback = FALLBACK_USERS[normalizedEmail];
      if (fallback && fallback.pass === password) {
        return {
          token: `mock-token-${fallback.role}-${Date.now()}`,
          user: {
            id: fallback.id,
            email: normalizedEmail,
            role: fallback.role,
            settings: memoryUserSettings[fallback.id] || {
              unit: 'kilometers',
              radius: 50,
              searchCriteria: DEFAULT_SEARCH_CRITERIA,
            },
            savedAreas: (memoryUserAreas[fallback.id] || []).map(formatSavedArea),
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
      const { userId, email } = requireAuth(context);

      try {
        const user = await User.findOne({ email });
        if (user) {
          if (!user.settings) {
            user.settings = { unit: 'kilometers', radius: 50 } as any;
          }
          user.settings.unit = unit === 'miles' ? 'miles' : 'kilometers';
          user.settings.radius = Number(radius) || 50;
          await user.save();
          return user.settings;
        }
      } catch (err) {
        // Fallback
      }

      const current = memoryUserSettings[userId] || {
        unit: 'kilometers',
        radius: 50,
        searchCriteria: DEFAULT_SEARCH_CRITERIA,
      };
      current.unit = unit === 'miles' ? 'miles' : 'kilometers';
      current.radius = Number(radius) || 50;
      memoryUserSettings[userId] = current;
      return current;
    },

    updateSearchCriteria: async (
      _: any,
      { input }: { input: Partial<ISearchCriteria> },
      context: any
    ) => {
      const { userId, email } = requireAuth(context);

      try {
        const user = await User.findOne({ email });
        if (user) {
          if (!user.settings) {
            user.settings = { unit: 'kilometers', radius: 50 } as any;
          }
          user.settings.searchCriteria = {
            ...(user.settings.searchCriteria || DEFAULT_SEARCH_CRITERIA),
            ...input,
          };
          await user.save();
          return user.settings.searchCriteria;
        }
      } catch (err) {
        // Fallback
      }

      const current = memoryUserSettings[userId] || {
        unit: 'kilometers',
        radius: 50,
        searchCriteria: DEFAULT_SEARCH_CRITERIA,
      };
      current.searchCriteria = {
        ...(current.searchCriteria || DEFAULT_SEARCH_CRITERIA),
        ...input,
      };
      memoryUserSettings[userId] = current;
      return current.searchCriteria;
    },

    saveUserArea: async (
      _: any,
      { name, polygon }: { name: String; polygon: IPoint[] },
      context: any
    ) => {
      const { userId, email } = requireAuth(context);

      const newAreaId = `area-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const areaName = (name || 'Custom Search Area').toString();

      try {
        const dbArea = new Areas({
          id: newAreaId,
          userId: email,
          name: areaName,
          polygon,
          properties: [],
          candidateProperties: [],
        });
        await dbArea.save();

        const user = await User.findOne({ email });
        if (user) {
          user.savedAreas.push({
            id: newAreaId,
            name: areaName,
            polygon,
            properties: [],
            candidateProperties: [],
            createdAt: new Date(),
          });
          await user.save();
        }

        return formatSavedArea(dbArea);
      } catch (err) {
        // Fallback
      }

      const memArea: ISavedArea = {
        id: newAreaId,
        name: areaName,
        polygon,
        properties: [],
        candidateProperties: [],
        createdAt: new Date(),
      };
      memoryUserAreas[userId] = memoryUserAreas[userId] || [];
      memoryUserAreas[userId].push(memArea);
      return formatSavedArea(memArea);
    },

    deleteUserArea: async (_: any, { id }: { id: string }, context: any) => {
      const { userId, email } = requireAuth(context);

      try {
        await Areas.deleteOne({ id, userId: email });
        const user = await User.findOne({ email });
        if (user) {
          user.savedAreas = user.savedAreas.filter((a) => a.id !== id);
          await user.save();
        }
      } catch (err) {
        // Fallback
      }

      if (memoryUserAreas[userId]) {
        memoryUserAreas[userId] = memoryUserAreas[userId].filter((a) => a.id !== id);
      }
      return true;
    },

    executeAreaSearch: async (_: any, { areaId }: { areaId: string }, context: any) => {
      const { userId, email } = requireAuth(context);

      let user: any = null;
      let targetDbArea: any = null;

      try {
        user = await User.findOne({ email });
        targetDbArea = await Areas.findOne({ id: areaId });
      } catch (err) {
        // Fallback
      }

      const memoryAreas: ISavedArea[] = memoryUserAreas[userId] || [];
      const memTarget = memoryAreas.find((a) => a.id === areaId);
      const userSavedTarget = user ? user.savedAreas.find((a: any) => a.id === areaId) : null;

      const targetArea = targetDbArea || userSavedTarget || memTarget;

      const searchPolygon =
        targetArea && targetArea.polygon && targetArea.polygon.length >= 3
          ? targetArea.polygon
          : [
              { lat: 43.6492, lng: -79.3838 },
              { lat: 43.6421, lng: -79.3809 },
              { lat: 43.6498, lng: -79.3892 },
            ];

      const searchCriteria =
        user?.settings?.searchCriteria || memoryUserSettings[userId]?.searchCriteria || DEFAULT_SEARCH_CRITERIA;

      const provider = RealEstateProviderFactory.getProvider();
      const results: IPropertyListing[] = await provider.searchPolygon(searchPolygon, searchCriteria);

      if (targetDbArea) {
        targetDbArea.properties = results;
        await targetDbArea.save();
        if (userSavedTarget) {
          userSavedTarget.properties = results;
          await user.save();
        }
        return formatSavedArea(targetDbArea);
      }

      if (userSavedTarget) {
        userSavedTarget.properties = results;
        await user.save();
        return formatSavedArea(userSavedTarget);
      }

      if (memTarget) {
        memTarget.properties = results;
        return formatSavedArea(memTarget);
      }

      const fallbackArea: ISavedArea = {
        id: areaId,
        name: 'Sample Area',
        polygon: searchPolygon,
        properties: results,
        candidateProperties: [],
        createdAt: new Date(),
      };
      return formatSavedArea(fallbackArea);
    },

    transferPropertyToCandidate: async (
      _: any,
      { areaId, zpid }: { areaId: string; zpid: string },
      context: any
    ) => {
      const { userId, email } = requireAuth(context);

      let user: any = null;
      let targetDbArea: any = null;

      try {
        user = await User.findOne({ email });
        targetDbArea = await Areas.findOne({ id: areaId });
      } catch (err) {
        // Fallback
      }

      const memoryAreas: ISavedArea[] = memoryUserAreas[userId] || [];
      const memTarget = memoryAreas.find((a) => a.id === areaId);
      const userSavedTarget = user ? user.savedAreas.find((a: any) => a.id === areaId) : null;

      const targetArea = targetDbArea || userSavedTarget || memTarget;

      if (targetArea) {
        const currentProps = targetArea.properties || [];
        const currentCand = targetArea.candidateProperties || targetArea.preCandidateProperties || [];

        const foundIndex = currentProps.findIndex((p: any) => p.zpid === zpid);
        if (foundIndex !== -1) {
          const [transferred] = currentProps.splice(foundIndex, 1);
          currentCand.push(transferred);
          targetArea.properties = currentProps;
          targetArea.candidateProperties = currentCand;
          targetArea.preCandidateProperties = currentCand;
        }

        if (targetDbArea) {
          await targetDbArea.save();
        }
        if (user) {
          await user.save();
        }
        return formatSavedArea(targetArea);
      }

      const fallbackArea: ISavedArea = {
        id: areaId,
        name: 'Sample Area',
        polygon: [{ lat: 43.65, lng: -79.38 }],
        properties: DEFAULT_SAMPLE_PROPERTIES,
        candidateProperties: [],
        createdAt: new Date(),
      };
      return formatSavedArea(fallbackArea);
    },

    transferPropertyToPreCandidate: async (
      parent: any,
      args: { areaId: string; zpid: string },
      context: any
    ) => {
      return resolvers.Mutation.transferPropertyToCandidate(parent, args, context);
    },
  },
};
