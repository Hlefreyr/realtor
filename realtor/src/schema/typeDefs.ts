export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Health {
    status: String!
    service: String!
    timestamp: String!
  }

  type Query {
    hello: String!
    me: User
    health: Health!
  }

  type Mutation {
    login(email: String!, password: String!): AuthPayload!
  }
`;
