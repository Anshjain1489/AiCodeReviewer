const request = require('supertest');
const app = require('../src/app');

describe('Full Application Integration Tests with Firestore Repository Layer', () => {
  let userToken;
  let userId;
  let projectId;
  let reviewId;

  const testUser = {
    name: 'Test Engineer',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
  };

  it('1. POST /api/v1/auth/register should create a new user doc in Firestore', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(testUser);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.token).toBeDefined();
    userToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('2. POST /api/v1/auth/login should authenticate user from Firestore', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: testUser.email,
      password: testUser.password,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('3. GET /api/v1/auth/me should fetch authenticated profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.user.email).toBe(testUser.email.toLowerCase());
  });

  it('4. POST /api/v1/projects should create a project in Firestore', async () => {
    const res = await request(app)
      .post('/api/v1/projects')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        name: 'Firestore Demo Microservice',
        description: 'Testing migration to Firebase Firestore',
        language: 'javascript',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.project.id).toBeDefined();
    projectId = res.body.data.project.id;
  });

  it('5. GET /api/v1/projects should list user projects with counts', async () => {
    const res = await request(app)
      .get('/api/v1/projects')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data.projects)).toBe(true);
    expect(res.body.data.projects.length).toBeGreaterThan(0);
  });

  it('6. POST /api/v1/reviews should initiate code analysis', async () => {
    const sampleCode = `
      function calculateSum(a, b) {
        var result = eval("a + b");
        return result;
      }
    `;

    const res = await request(app)
      .post('/api/v1/reviews')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        projectId,
        code: sampleCode,
        language: 'javascript',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.reviewId).toBeDefined();
    reviewId = res.body.data.reviewId;
  });

  it('7. GET /api/v1/dashboard/summary should calculate metrics from Firestore', async () => {
    const res = await request(app)
      .get('/api/v1/dashboard/summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.totalReviews).toBeDefined();
    expect(res.body.data.averageScore).toBeDefined();
  });
});
