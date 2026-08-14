const request = require('supertest');
const app = require('../src/app');

describe('Auth & Health API Integration Tests', () => {
  it('GET /api/v1/health should return status ok', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('ok');
  });

  it('POST /api/v1/auth/register should validate missing fields', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
