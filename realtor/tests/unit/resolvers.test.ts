import { resolvers } from '../../src/schema/resolvers';

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
});
