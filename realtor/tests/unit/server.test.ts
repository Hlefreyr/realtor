import request from 'supertest';
import { createServer, AppServer } from '../../src/server';

describe('Server & GraphQL Endpoint Tests', () => {
  let serverInstance: AppServer;

  beforeAll(async () => {
    serverInstance = await createServer();
  });

  afterAll(async () => {
    await serverInstance.stop();
  });

  it('should return 200 on GET /health', async () => {
    const res = await request(serverInstance.app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('UP');
    expect(res.body.timestamp).toBeDefined();
  });

  it('should execute hello GraphQL query successfully', async () => {
    const query = `
      query GetHello {
        hello
      }
    `;

    const res = await request(serverInstance.app)
      .post('/graphql')
      .send({ query });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.hello).toBe('Hello Realtor! Welcome to your full-stack real estate platform.');
  });

  it('should execute health GraphQL query successfully', async () => {
    const query = `
      query GetHealth {
        health {
          status
          service
          timestamp
        }
      }
    `;

    const res = await request(serverInstance.app)
      .post('/graphql')
      .send({ query });

    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.health.status).toBe('UP');
    expect(res.body.data.health.service).toBe('realtor-backend');
    expect(res.body.data.health.timestamp).toBeDefined();
  });

  it('should return GraphQL error for invalid query', async () => {
    const query = `
      query InvalidQuery {
        nonExistentField
      }
    `;

    const res = await request(serverInstance.app)
      .post('/graphql')
      .send({ query });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors.length).toBeGreaterThan(0);
  });

  it('should execute start hook without error', async () => {
    await expect(serverInstance.start()).resolves.toBeUndefined();
  });
});
