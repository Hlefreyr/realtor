import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, NormalizedCacheObject } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { getSession } from '../utils/session';

export const getGraphQLUri = (customEnv?: Record<string, string | undefined>): string => {
  const env = customEnv || (typeof process !== 'undefined' ? process.env : {});
  const uri = env['EXPO_PUBLIC_GRAPHQL_URI'] || env['REACT_APP_GRAPHQL_URI'];

  let resolved = '';
  if (uri && typeof uri === 'string' && uri.trim().length > 0 && uri !== 'undefined') {
    resolved = uri.trim();
  }

  // Dynamic host resolution for browser environments
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const browserHostname = window.location.hostname.toLowerCase();
    const browserProtocol = window.location.protocol || 'http:';

    // If browser hostname starts with "frigg.", map to "frigg-api." subdomain
    const isFriggSubdomain = browserHostname.startsWith('frigg.');
    const apiHostname = isFriggSubdomain
      ? browserHostname.replace(/^frigg\./, 'frigg-api.')
      : browserHostname;

    if (resolved) {
      try {
        const parsed = new URL(resolved);
        if (
          (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
          browserHostname !== 'localhost' &&
          browserHostname !== '127.0.0.1'
        ) {
          parsed.protocol = browserProtocol;
          parsed.hostname = apiHostname;
          parsed.port =
            browserProtocol === 'https:'
              ? ''
              : window.location.port === '8080'
              ? '4000'
              : window.location.port || '4000';
          return parsed.toString();
        }
        return resolved;
      } catch {
        return resolved;
      }
    }

    if (isFriggSubdomain) {
      const portPart =
        browserProtocol === 'https:'
          ? ''
          : window.location.port === '8080'
          ? ':4000'
          : window.location.port
          ? `:${window.location.port}`
          : ':4000';
      return `${browserProtocol}//${apiHostname}${portPart}/graphql`;
    }

    return `${browserProtocol}//${browserHostname}:4000/graphql`;
  }

  if (resolved) {
    return resolved;
  }

  return 'http://localhost:4000/graphql';
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
});

export const authLink = setContext((_, { headers }) => {
  const session = getSession();
  const token = session?.token;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

export const createApolloClient = (
  uri?: string,
  customEnv?: Record<string, string | undefined>
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = new HttpLink({
    uri: uri || getGraphQLUri(customEnv),
    fetch: typeof window !== 'undefined' ? window.fetch.bind(window) : undefined,
  });

  return new ApolloClient({
    link: ApolloLink.from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
  });
};

export const client = createApolloClient();
