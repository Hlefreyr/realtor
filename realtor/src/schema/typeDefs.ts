export const typeDefs = `#graphql
  type HealthStatus {
    status: String!
    timestamp: String!
    service: String!
  }

  type Query {
    hello: String!
    health: HealthStatus!
  }
`;
