import { resolvers } from '../../src/schema/resolvers';
import { User } from '../../src/models/User';

describe('GraphQL Resolvers Unit Tests', () => {
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

  describe('Mutation.login fallbacks', () => {
    beforeEach(() => {
      jest.spyOn(User, 'findOne').mockResolvedValue(null);
    });

    it('should authenticate admin fallback credentials when DB returns null', async () => {
      const res = await resolvers.Mutation.login(null, {
        email: 'admin@realtor.com',
        password: 'admin',
      });
      expect(res.user.role).toBe('admin');
      expect(res.token).toContain('mock-token-admin-');
    });

    it('should authenticate standard user fallback credentials when DB returns null', async () => {
      const res = await resolvers.Mutation.login(null, {
        email: 'user@realtor.com',
        password: 'user',
      });
      expect(res.user.role).toBe('user');
      expect(res.token).toContain('mock-token-user-');
    });

    it('should handle Mongoose query error gracefully and fallback', async () => {
      jest.spyOn(User, 'findOne').mockRejectedValueOnce(new Error('Connection error'));
      const res = await resolvers.Mutation.login(null, {
        email: 'admin@realtor.com',
        password: 'admin',
      });
      expect(res.user.role).toBe('admin');
    });

    it('should throw GraphQLError for invalid credentials when DB returns null', async () => {
      await expect(
        resolvers.Mutation.login(null, {
          email: 'invalid@realtor.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });
});
