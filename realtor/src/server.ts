import express, { Application, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { expressMiddleware } from '@apollo/server/express4';
import cors from 'cors';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';

export interface AppServer {
  app: Application;
  apolloServer: ApolloServer;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

export interface ServerOptions {
  isProduction?: boolean;
}

export const createServer = async (options?: ServerOptions): Promise<AppServer> => {
  const app: Application = express();

  const isProduction =
    options?.isProduction !== undefined
      ? options.isProduction
      : process.env.NODE_ENV === 'production' || process.env.APP_ENV === 'production';

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
    introspection: !isProduction,
    plugins: isProduction ? [ApolloServerPluginLandingPageDisabled()] : [],
  });

  await apolloServer.start();

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = /^https?:\/\/(localhost|127\.0\.0\.1|([a-zA-Z0-9-]+\.)?(hlefreyr|flefreyr)\.(org|com))(:\d+)?$/i.test(
        origin
      );
      if (isAllowed) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  };

  app.use(cors(corsOptions));

  // Rest health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // Apollo GraphQL endpoint
  app.use(
    '/graphql',
    cors(corsOptions),
    express.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    })
  );

  return {
    app,
    apolloServer,
    start: async () => {
      // noop
    },
    stop: async () => {
      await apolloServer.stop();
    },
  };
};
