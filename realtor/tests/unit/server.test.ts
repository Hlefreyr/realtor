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

  it('should allow CORS from localhost, frigg.hlefreyr.org, and frigg-api.hlefreyr.org origins', async () => {
    const localhostRes = await request(serverInstance.app)
      .get('/health')
      .set('Origin', 'http://localhost:8080');
    expect(localhostRes.status).toBe(200);
    expect(localhostRes.headers['access-control-allow-origin']).toBe('http://localhost:8080');

    const friggApiRes = await request(serverInstance.app)
      .get('/health')
      .set('Origin', 'https://frigg-api.hlefreyr.org');
    expect(friggApiRes.status).toBe(200);
    expect(friggApiRes.headers['access-control-allow-origin']).toBe('https://frigg-api.hlefreyr.org');

    const friggOrgRes = await request(serverInstance.app)
      .get('/health')
      .set('Origin', 'https://frigg.hlefreyr.org');
    expect(friggOrgRes.status).toBe(200);
    expect(friggOrgRes.headers['access-control-allow-origin']).toBe('https://frigg.hlefreyr.org');

    const friggFlefreyrRes = await request(serverInstance.app)
      .get('/health')
      .set('Origin', 'https://frigg.flefreyr.org');
    expect(friggFlefreyrRes.status).toBe(200);
    expect(friggFlefreyrRes.headers['access-control-allow-origin']).toBe('https://frigg.flefreyr.org');

    const fallbackRes = await request(serverInstance.app)
      .get('/health')
      .set('Origin', 'https://other-domain.example');
    expect(fallbackRes.status).toBe(200);
    expect(fallbackRes.headers['access-control-allow-origin']).toBe('https://other-domain.example');
  });

  it('should allow introspection in development mode', async () => {
    const devServer = await createServer({ isProduction: false });
    const query = `
      query Introspect {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const res = await request(devServer.app)
      .post('/graphql')
      .send({ query });

    expect(res.status).toBe(200);
    expect(res.body.data?.__schema).toBeDefined();
    await devServer.stop();
  });

  it('should block introspection in production mode', async () => {
    const prodServer = await createServer({ isProduction: true });
    const query = `
      query Introspect {
        __schema {
          types {
            name
          }
        }
      }
    `;

    const res = await request(prodServer.app)
      .post('/graphql')
      .send({ query });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toMatch(/introspection/i);
    await prodServer.stop();
  });

  it('should execute start hook without error', async () => {
    await expect(serverInstance.start()).resolves.toBeUndefined();
  });
});
