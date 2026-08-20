import { getGraphQLUri, createApolloClient } from '../../src/apollo/client';

describe('Apollo Client Unit Tests', () => {
  it('should return custom URI from env if set', () => {
    const env = { EXPO_PUBLIC_GRAPHQL_URI: 'https://api.realtor.example/graphql' };
    expect(getGraphQLUri(env)).toBe('https://api.realtor.example/graphql');
  });

  it('should fallback to REACT_APP_GRAPHQL_URI if EXPO_PUBLIC is not set', () => {
    const env = { REACT_APP_GRAPHQL_URI: 'https://api2.realtor.example/graphql' };
    expect(getGraphQLUri(env)).toBe('https://api2.realtor.example/graphql');
  });

  it('should return default localhost URI if env is not set, empty, or undefined string', () => {
    expect(getGraphQLUri({})).toBe('http://localhost:4000/graphql');
    expect(getGraphQLUri({ EXPO_PUBLIC_GRAPHQL_URI: '   ' })).toBe('http://localhost:4000/graphql');
    expect(getGraphQLUri({ EXPO_PUBLIC_GRAPHQL_URI: 'undefined' })).toBe('http://localhost:4000/graphql');
  });

  it('should instantiate ApolloClient with custom URI', () => {
    const client = createApolloClient('http://custom-host:5000/graphql');
    expect(client).toBeDefined();
    expect(client.cache).toBeDefined();
  });

  it('should instantiate ApolloClient with default URI', () => {
    const client = createApolloClient();
    expect(client).toBeDefined();
    expect(client.cache).toBeDefined();
  });
});
