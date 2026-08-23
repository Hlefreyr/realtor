export const typeDefs = `#graphql
  type Point {
    lat: Float!
    lng: Float!
  }

  input PointInput {
    lat: Float!
    lng: Float!
  }

  type SavedArea {
    id: ID!
    name: String!
    polygon: [Point!]!
    createdAt: String
  }

  type UserSettings {
    unit: String!
    radius: Float!
  }

  type User {
    id: ID!
    email: String!
    role: String!
    settings: UserSettings!
    savedAreas: [SavedArea!]!
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
    updateUserSettings(unit: String!, radius: Float!): UserSettings!
    saveUserArea(name: String!, polygon: [PointInput!]!): SavedArea!
    deleteUserArea(id: ID!): Boolean!
  }
`;
