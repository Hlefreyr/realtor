import { getGraphQLUri, createApolloClient } from '../../src/apollo/client';
import { execute, ApolloLink, Observable } from '@apollo/client';
import { gql } from '@apollo/client';

describe('Apollo Client Configuration Unit Tests', () => {
  it('should return default fallback URI when no environment variable is provided', () => {
    const uri = getGraphQLUri({});
    expect(uri).toBe('http://localhost:4000/graphql');
  });

  it('should return custom URI when EXPO_PUBLIC_GRAPHQL_URI is set', () => {
    const uri = getGraphQLUri({ EXPO_PUBLIC_GRAPHQL_URI: 'https://api.realtor.com/graphql' });
    expect(uri).toBe('https://api.realtor.com/graphql');
  });

  it('should return custom URI when REACT_APP_GRAPHQL_URI is set', () => {
    const uri = getGraphQLUri({ REACT_APP_GRAPHQL_URI: 'https://app.realtor.com/graphql ' });
    expect(uri).toBe('https://app.realtor.com/graphql');
  });

  it('should create ApolloClient instance with specified uri', () => {
    const client = createApolloClient('http://test-server:4000/graphql');
    expect(client).toBeTruthy();
    expect(client.link).toBeTruthy();
  });

  it('should log GraphQL and network errors in errorLink', (done) => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    const client = createApolloClient();
    const testQuery = gql`
      query Test {
        test
      }
    `;

    // Create a link that simulates errors
    const mockErrorLink = new ApolloLink(() => {
      return new Observable((observer) => {
        observer.next({
          errors: [{ message: 'Mock GraphQL Error', locations: undefined, path: undefined }],
        });
        observer.error(new Error('Mock Network Error'));
      });
    });

    const combinedLink = ApolloLink.from([client.link, mockErrorLink]);

    execute(combinedLink, { query: testQuery }).subscribe({
      next: () => {},
      error: () => {
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
        done();
      },
    });
  });
});
