import express, { Application, Request, Response } from 'express';
import { ApolloServer } from '@apollo/server';
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

export const createServer = async (): Promise<AppServer> => {
  const app: Application = express();

  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  app.use(cors());
  app.use(express.json());

  // Rest health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
  });

  // Apollo GraphQL endpoint
  app.use(
    '/graphql',
    expressMiddleware(apolloServer, {
      context: async ({ req }) => ({ token: req.headers.authorization }),
    })
  );

  return {
    app,
    apolloServer,
    start: async () => {
      // noop or additional start hooks
    },
    stop: async () => {
      await apolloServer.stop();
    },
  };
};
