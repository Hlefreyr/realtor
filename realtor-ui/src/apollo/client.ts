import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, NormalizedCacheObject } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

export const getGraphQLUri = (customEnv?: Record<string, string | undefined>): string => {
  const env = customEnv || (typeof process !== 'undefined' ? process.env : {});
  const uri = env['EXPO_PUBLIC_GRAPHQL_URI'] || env['REACT_APP_GRAPHQL_URI'];

  if (uri && typeof uri === 'string' && uri.trim().length > 0 && uri !== 'undefined') {
    return uri.trim();
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

export const createApolloClient = (
  uri?: string,
  customEnv?: Record<string, string | undefined>
): ApolloClient<NormalizedCacheObject> => {
  const httpLink = new HttpLink({
    uri: uri || getGraphQLUri(customEnv),
    fetch: typeof window !== 'undefined' ? window.fetch.bind(window) : undefined,
  });

  return new ApolloClient({
    link: ApolloLink.from([errorLink, httpLink]),
    cache: new InMemoryCache(),
  });
};

export const client = createApolloClient();
