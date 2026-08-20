import { ApolloClient, InMemoryCache, HttpLink, NormalizedCacheObject } from '@apollo/client';

export const getGraphQLUri = (customEnv?: Record<string, string | undefined>): string => {
  const env = customEnv || (typeof process !== 'undefined' ? process.env : {});
  const uri = env['EXPO_PUBLIC_GRAPHQL_URI'] || env['REACT_APP_GRAPHQL_URI'];

  if (uri && typeof uri === 'string' && uri.trim().length > 0 && uri !== 'undefined') {
    return uri.trim();
  }
  return 'http://localhost:4000/graphql';
};

export const createApolloClient = (
  uri?: string,
  customEnv?: Record<string, string | undefined>
): ApolloClient<NormalizedCacheObject> => {
  return new ApolloClient({
    link: new HttpLink({
      uri: uri || getGraphQLUri(customEnv),
    }),
    cache: new InMemoryCache(),
  });
};

export const client = createApolloClient();
