export const resolvers = {
  Query: {
    hello: (): string => {
      return 'Hello Realtor! Welcome to your full-stack real estate platform.';
    },
    health: () => {
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        service: 'realtor-backend',
      };
    },
  },
};
