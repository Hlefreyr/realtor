import { getGraphQLUri, createApolloClient } from '../../src/apollo/client';
import { execute, ApolloLink, Observable, gql } from '@apollo/client';

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

  it('should dynamically resolve API host to frigg-api.<domain> when accessed in browser', () => {
    const originalWindow = global.window;
    try {
      // Mock browser window location on frigg.hlefreyr.org
      (global as any).window = {
        location: {
          hostname: 'frigg.hlefreyr.org',
          protocol: 'https:',
          port: '',
        },
      };

      // When accessed via https on frigg.hlefreyr.org
      expect(getGraphQLUri({})).toBe('https://frigg-api.hlefreyr.org/graphql');

      // When env defaults to localhost, it adapts to https://frigg-api.hlefreyr.org/graphql
      expect(getGraphQLUri({ EXPO_PUBLIC_GRAPHQL_URI: 'http://localhost:4000/graphql' })).toBe(
        'https://frigg-api.hlefreyr.org/graphql'
      );

      // When accessed via http on frigg.flefreyr.org:8080
      (global as any).window.location.hostname = 'frigg.flefreyr.org';
      (global as any).window.location.protocol = 'http:';
      (global as any).window.location.port = '8080';
      expect(getGraphQLUri({})).toBe('http://frigg-api.flefreyr.org:4000/graphql');
    } finally {
      (global as any).window = originalWindow;
    }
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

  it('should attach authorization header in authLink when session token exists', (done) => {
    const { authLink } = require('../../src/apollo/client');
    const sessionUtils = require('../../src/utils/session');
    const spy = jest.spyOn(sessionUtils, 'getSession').mockReturnValue({ token: 'test-token-123' } as any);

    let capturedHeaders: any = null;
    const mockTerminatingLink = new ApolloLink((operation) => {
      capturedHeaders = operation.getContext().headers;
      return new Observable((observer) => {
        observer.next({ data: { ok: true } });
        observer.complete();
      });
    });

    const testLink = ApolloLink.from([authLink, mockTerminatingLink]);

    execute(testLink, { query: gql`query TestAuth { ok }` }).subscribe({
      next: () => {
        expect(capturedHeaders.authorization).toBe('Bearer test-token-123');
        spy.mockRestore();
        done();
      },
      error: (err) => {
        spy.mockRestore();
        done(err);
      },
    });
  });
});
