import { resolvers } from '../../src/schema/resolvers';
import { User } from '../../src/models/User';
import { Areas } from '../../src/models/Areas';
import { PropertyData } from '../../src/models/PropertyData';

describe('GraphQL Resolvers Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
    jest.spyOn(PropertyData, 'findOne').mockResolvedValue(null);
    jest.spyOn(PropertyData, 'findOneAndUpdate').mockResolvedValue(null as any);
    jest.spyOn(Areas, 'find').mockResolvedValue([]);
    jest.spyOn(Areas, 'findOne').mockResolvedValue(null);
    jest.spyOn(Areas, 'deleteOne').mockResolvedValue({ acknowledged: true, deletedCount: 1 });
    jest.spyOn(Areas.prototype, 'save').mockImplementation(function (this: any) {
      return Promise.resolve(this);
    });
  });

  describe('Query.hello', () => {
    it('should return the Hello Realtor greeting string', () => {
      const result = resolvers.Query.hello();
      expect(result).toBe('Hello Realtor! Welcome to your full-stack real estate platform.');
    });
  });

  describe('Query.health', () => {
    it('should return health status UP with a timestamp and service name', () => {
      const result = resolvers.Query.health();
      expect(result.status).toBe('UP');
      expect(result.service).toBe('realtor-backend');
      expect(new Date(result.timestamp).getTime()).not.toBeNaN();
    });
  });

  describe('Query.me', () => {
    it('should return context user if present', async () => {
      const mockUser = { id: '1', email: 'test@realtor.com', role: 'user', settings: { unit: 'kilometers', radius: 50 }, savedAreas: [] };
      const res = await resolvers.Query.me(null, null, { user: mockUser });
      expect(res).toEqual(mockUser);
    });

    it('should return default user context if context is empty or undefined', async () => {
      const user1 = await resolvers.Query.me(null, null, {});
      expect(user1.role).toBe('user');
      expect(user1.settings.unit).toBe('kilometers');

      const user2 = await resolvers.Query.me(null, null, undefined);
      expect(user2.role).toBe('user');
    });

    it('should return admin context if admin token provided', async () => {
      const user = await resolvers.Query.me(null, null, { token: 'mock-token-admin-123' });
      expect(user.role).toBe('admin');
    });

    it('should return user from DB with existing id, settings, and savedAreas', async () => {
      const mockDbUser = {
        id: 'explicit-db-id',
        email: 'user@realtor.com',
        role: 'user',
        settings: { unit: 'miles', radius: 25 },
        savedAreas: [{ id: 'a1', name: 'Area 1', polygon: [] }],
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockDbUser as any);
      const user = await resolvers.Query.me(null, null, { token: 'mock-token-user-123' });
      expect(user.id).toBe('explicit-db-id');
      expect(user.settings).toEqual({ unit: 'miles', radius: 25 });
      expect(user.savedAreas).toHaveLength(1);
    });

    it('should return user from DB with null settings and savedAreas fallbacks', async () => {
      const mockDbUser = {
        _id: 'db-id-1',
        email: 'user@realtor.com',
        role: 'user',
        settings: null,
        savedAreas: null,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockDbUser as any);
      const user = await resolvers.Query.me(null, null, { token: 'mock-token-user-123' });
      expect(user.id).toBe('db-id-1');
      expect(user.settings).toEqual({ unit: 'kilometers', radius: 50 });
      expect(user.savedAreas).toEqual([]);
    });

    it('should handle DB query error in Query.me gracefully', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB Error'));
      const user = await resolvers.Query.me(null, null, { token: 'mock-token-user-123' });
      expect(user.role).toBe('user');
    });
  });

  describe('Mutation.updateUserSettings', () => {
    it('should update user settings with radius 0 fallback to 50', async () => {
      const settings = await resolvers.Mutation.updateUserSettings(
        null,
        { unit: 'miles', radius: 0 },
        undefined
      );
      expect(settings.unit).toBe('miles');
      expect(settings.radius).toBe(50);
    });

    it('should update user settings to kilometers for admin in memory fallback', async () => {
      const settings = await resolvers.Mutation.updateUserSettings(
        null,
        { unit: 'kilometers', radius: 100 },
        { token: 'mock-token-admin-123' }
      );
      expect(settings.unit).toBe('kilometers');
      expect(settings.radius).toBe(100);
    });

    it('should update user settings in DB if user is found', async () => {
      const mockUser = {
        email: 'user@realtor.com',
        settings: { unit: 'kilometers', radius: 50 },
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const settings = await resolvers.Mutation.updateUserSettings(
        null,
        { unit: 'miles', radius: 40 },
        { token: 'mock-token-user-123' }
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(settings.unit).toBe('miles');
    });

    it('should handle DB save error in updateUserSettings gracefully', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB Error'));
      const settings = await resolvers.Mutation.updateUserSettings(
        null,
        { unit: 'miles', radius: 10 },
        { token: 'mock-token-user-123' }
      );
      expect(settings.unit).toBe('miles');
    });
  });

  describe('Mutation.saveUserArea and deleteUserArea', () => {
    it('should save a new polygon area and then delete it via memory fallback without context', async () => {
      const polygon = [
        { lat: 37.77, lng: -122.41 },
        { lat: 37.78, lng: -122.42 },
        { lat: 37.76, lng: -122.43 },
      ];

      const area = await resolvers.Mutation.saveUserArea(
        null,
        { name: 'Bay Area', polygon },
        undefined
      );

      expect(area.name).toBe('Bay Area');
      expect(area.polygon).toHaveLength(3);

      const deleted = await resolvers.Mutation.deleteUserArea(
        null,
        { id: area.id },
        undefined
      );
      expect(deleted).toBe(true);
    });

    it('should save area with default fallback name if name is empty', async () => {
      const area = await resolvers.Mutation.saveUserArea(
        null,
        { name: '', polygon: [] },
        { token: 'mock-token-admin-123' }
      );
      expect(area.name).toBe('Custom Search Area');
    });

    it('should save area and delete area in DB if user is found', async () => {
      const mockUser = {
        email: 'user@realtor.com',
        savedAreas: [{ id: 'area-1', name: 'Test', polygon: [] }],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const area = await resolvers.Mutation.saveUserArea(
        null,
        { name: 'Downtown', polygon: [{ lat: 1, lng: 1 }] },
        { token: 'mock-token-user-123' }
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(area.name).toBe('Downtown');

      const deleted = await resolvers.Mutation.deleteUserArea(
        null,
        { id: 'area-1' },
        { token: 'mock-token-user-123' }
      );
      expect(deleted).toBe(true);
    });

    it('should handle DB save error in saveUserArea and deleteUserArea gracefully', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB Error'));
      const area = await resolvers.Mutation.saveUserArea(
        null,
        { name: 'Error Area', polygon: [] },
        { token: 'mock-token-user-123' }
      );
      expect(area.name).toBe('Error Area');

      const deleted = await resolvers.Mutation.deleteUserArea(
        null,
        { id: 'nonexistent' },
        { token: 'mock-token-user-123' }
      );
      expect(deleted).toBe(true);
    });
  });

  describe('Mutation.login with DB user branches and fallback passwords', () => {
    it('should authenticate DB user with populated settings and savedAreas', async () => {
      const mockUser = {
        id: 'full-db-user-id',
        email: 'user@realtor.com',
        role: 'user',
        settings: { unit: 'miles', radius: 100 },
        savedAreas: [{ id: 'a2', name: 'Area 2', polygon: [] }],
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const res = await resolvers.Mutation.login(null, {
        email: 'user@realtor.com',
        password: 'password',
      });
      expect(res.user.id).toBe('full-db-user-id');
      expect(res.user.settings).toEqual({ unit: 'miles', radius: 100 });
      expect(res.user.savedAreas).toHaveLength(1);
    });

    it('should authenticate DB user with null settings and savedAreas', async () => {
      const mockUser = {
        _id: 'db-user-id',
        email: 'user@realtor.com',
        role: 'user',
        settings: null,
        savedAreas: null,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const res = await resolvers.Mutation.login(null, {
        email: 'user@realtor.com',
        password: 'password',
      });
      expect(res.user.settings).toEqual({ unit: 'kilometers', radius: 50 });
      expect(res.user.savedAreas).toEqual([]);
    });

    it('should throw error when DB user comparePassword returns false', async () => {
      const mockUser = {
        email: 'dbuser@realtor.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      await expect(
        resolvers.Mutation.login(null, {
          email: 'dbuser@realtor.com',
          password: 'wrongpass',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error when admin email provided with wrong password', async () => {
      await expect(
        resolvers.Mutation.login(null, {
          email: 'admin@realtor.com',
          password: 'wrongadminpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error when user email provided with wrong password', async () => {
      await expect(
        resolvers.Mutation.login(null, {
          email: 'user@realtor.com',
          password: 'wronguserpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should authenticate user with DB _id fallback', async () => {
      const mockUser = {
        _id: 'mongo-id-only',
        email: 'user@realtor.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const res = await resolvers.Mutation.login(null, {
        email: 'user@realtor.com',
        password: 'password',
      });
      expect(res.user.id).toBe('mongo-id-only');
    });

    it('should authenticate user with no id fallback to user123', async () => {
      const mockUser = {
        email: 'user@realtor.com',
        role: 'user',
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const res = await resolvers.Mutation.login(null, {
        email: 'user@realtor.com',
        password: 'password',
      });
      expect(res.user.id).toBe('user123');
    });
  });

  describe('Mutation.updateSearchCriteria', () => {
    it('should update search criteria in DB if user is found', async () => {
      const mockUser = {
        email: 'user@realtor.com',
        settings: { searchCriteria: {} },
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const criteria = await resolvers.Mutation.updateSearchCriteria(
        null,
        { input: { priceMin: 500000, priceMax: 1500000 } },
        { token: 'mock-token-user-123' }
      );
      expect(mockUser.save).toHaveBeenCalled();
      expect(criteria.priceMin).toBe(500000);
    });

    it('should fallback to in-memory store if DB query fails in updateSearchCriteria', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB Error'));
      const criteria = await resolvers.Mutation.updateSearchCriteria(
        null,
        { input: { priceMax: 900000 } },
        { token: 'mock-token-user-123' }
      );
      expect(criteria.priceMax).toBe(900000);
    });
  });

  describe('Mutation.executeAreaSearch & property transfers', () => {
    it('should execute area search for user saved target and fallback area', async () => {
      const mockAreaDoc = {
        id: 'target-db-area',
        properties: [],
        polygon: [{ lat: 43.65, lng: -79.38 }, { lat: 43.66, lng: -79.39 }, { lat: 43.67, lng: -79.40 }],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Areas, 'findOne').mockResolvedValue(mockAreaDoc as any);

      const dbAreaRes = await resolvers.Mutation.executeAreaSearch(
        null,
        { areaId: 'target-db-area' },
        { token: 'mock-token-user-123' }
      );
      expect(mockAreaDoc.save).toHaveBeenCalled();
      expect(dbAreaRes.id).toBe('target-db-area');

      // Test userSavedTarget branch
      jest.spyOn(Areas, 'findOne').mockResolvedValue(null);
      const mockUser = {
        email: 'user@realtor.com',
        savedAreas: [{ id: 'user-area-1', name: 'User Area 1', polygon: [{ lat: 43.65, lng: -79.38 }] }],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const userAreaRes = await resolvers.Mutation.executeAreaSearch(
        null,
        { areaId: 'user-area-1' },
        { token: 'mock-token-user-123' }
      );
      expect(userAreaRes.name).toBe('User Area 1');
      expect(mockUser.save).toHaveBeenCalled();

      // Test memTarget branch
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
      await resolvers.Mutation.saveUserArea(
        null,
        { name: 'Memory Area', polygon: [] },
        { token: 'mock-token-user-123' }
      );
      const memRes = await resolvers.Mutation.executeAreaSearch(
        null,
        { areaId: 'nonexistent-mem-area' },
        { token: 'mock-token-user-123' }
      );
      expect(memRes.name).toBe('Sample Area');
    });

    it('should transfer property using transferPropertyToCandidate and alias transferPropertyToPreCandidate', async () => {
      const mockAreaDoc = {
        id: 'db-transfer-area',
        properties: [{ zpid: 'prop-200', price: 600000, address: { streetAddress: '2 Main', city: 'Toronto', state: 'ON', zipcode: 'M5V' }, location: { latitude: 43.65, longitude: -79.38 } }],
        candidateProperties: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Areas, 'findOne').mockResolvedValue(mockAreaDoc as any);
      const mockUser = {
        email: 'user@realtor.com',
        savedAreas: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(User, 'findOne').mockResolvedValue(mockUser as any);

      const dbTransferred = await resolvers.Mutation.transferPropertyToCandidate(
        null,
        { areaId: 'db-transfer-area', zpid: 'prop-200' },
        { token: 'mock-token-user-123' }
      );
      expect(mockAreaDoc.save).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalled();
      expect(dbTransferred.candidateProperties).toHaveLength(1);

      jest.spyOn(Areas, 'findOne').mockResolvedValue(null);
      jest.spyOn(User, 'findOne').mockRejectedValue(new Error('DB Error'));

      const aliasTransferred = await resolvers.Mutation.transferPropertyToPreCandidate(
        null,
        { areaId: 'fallback-transfer-area', zpid: 'prop-999' },
        { token: 'mock-token-user-123' }
      );
      expect(aliasTransferred.name).toBe('Sample Area');
    });
  });
});
