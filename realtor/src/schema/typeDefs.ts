export const typeDefs = `#graphql
  type Point {
    lat: Float!
    lng: Float!
  }

  input PointInput {
    lat: Float!
    lng: Float!
  }

  type PropertyAddress {
    streetAddress: String!
    city: String!
    state: String!
    zipcode: String!
    country: String
  }

  type PropertyLocation {
    latitude: Float!
    longitude: Float!
  }

  type PropertyListing {
    zpid: String!
    property_id: String
    price: Float!
    currency: String
    address: PropertyAddress!
    location: PropertyLocation!
    bedrooms: Float
    bathrooms: Float
    livingArea: Float
    homeType: String
    homeStatus: String
    imgSrc: String
    detailUrl: String
    daysOnZillow: Float
    zestimate: Float
    rentZestimate: Float
  }

  type SearchCriteria {
    statusType: String!
    homeTypes: [String!]!
    priceMin: Float!
    priceMax: Float!
    bedsMin: Float!
    bedsMax: Float!
    bathsMin: Float!
    bathsMax: Float!
    sqftMin: Float!
    sqftMax: Float!
    yearBuiltMin: Float!
    yearBuiltMax: Float!
    daysOnMarket: Float!
  }

  input SearchCriteriaInput {
    statusType: String
    homeTypes: [String!]
    priceMin: Float
    priceMax: Float
    bedsMin: Float
    bedsMax: Float
    bathsMin: Float
    bathsMax: Float
    sqftMin: Float
    sqftMax: Float
    yearBuiltMin: Float
    yearBuiltMax: Float
    daysOnMarket: Float
  }

  type SavedArea {
    id: ID!
    name: String!
    polygon: [Point!]!
    properties: [PropertyListing!]!
    candidateProperties: [PropertyListing!]!
    createdAt: String
  }

  type UserSettings {
    unit: String!
    radius: Float!
    searchCriteria: SearchCriteria!
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
    updateSearchCriteria(input: SearchCriteriaInput!): SearchCriteria!
    saveUserArea(name: String!, polygon: [PointInput!]!): SavedArea!
    deleteUserArea(id: ID!): Boolean!
    executeAreaSearch(areaId: ID!): SavedArea!
    transferPropertyToCandidate(areaId: ID!, zpid: String!): SavedArea!
    transferPropertyToPreCandidate(areaId: ID!, zpid: String!): SavedArea!
  }
`;
