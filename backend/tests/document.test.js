const request = require('supertest');
const app = require('../src/app');

describe('Document Endpoints', () => {
  let user1Token, user1Id;
  let user2Token;

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({ email: 'u1@test.com', password: 'password', name: 'U1' });
    user1Token = res1.body.token;
    user1Id = res1.body.user.id;

    const res2 = await request(app).post('/api/auth/register').send({ email: 'u2@test.com', password: 'password', name: 'U2' });
    user2Token = res2.body.token;
  });

  it('should create a document', async () => {
    const res = await request(app)
      .post('/api/documents')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'My Doc' });
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.document.title).toEqual('My Doc');
    expect(res.body.document.ownerId).toEqual(user1Id);
  });

  it('should list only own documents', async () => {
    await request(app).post('/api/documents').set('Authorization', `Bearer ${user1Token}`).send({ title: 'Doc 1' });
    await request(app).post('/api/documents').set('Authorization', `Bearer ${user2Token}`).send({ title: 'Doc 2' });

    const res = await request(app).get('/api/documents').set('Authorization', `Bearer ${user1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.documents.length).toEqual(1);
    expect(res.body.documents[0].title).toEqual('Doc 1');
  });

  it('should get document you own', async () => {
    const createRes = await request(app).post('/api/documents').set('Authorization', `Bearer ${user1Token}`).send({ title: 'Doc' });
    const docId = createRes.body.document.id;

    const res = await request(app).get(`/api/documents/${docId}`).set('Authorization', `Bearer ${user1Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.document.permission).toEqual('owner');
  });

  it('should return 403 getting document you dont own without share', async () => {
    const createRes = await request(app).post('/api/documents').set('Authorization', `Bearer ${user1Token}`).send({ title: 'Doc' });
    const docId = createRes.body.document.id;

    const res = await request(app).get(`/api/documents/${docId}`).set('Authorization', `Bearer ${user2Token}`);
    expect(res.statusCode).toEqual(403);
  });

  it('should return 404 for non-existent document', async () => {
    const res = await request(app).get('/api/documents/invalid-id-that-is-long-enough').set('Authorization', `Bearer ${user1Token}`);
    expect(res.statusCode).toEqual(404);
  });

  it('should update title and content as owner', async () => {
    const createRes = await request(app).post('/api/documents').set('Authorization', `Bearer ${user1Token}`).send({ title: 'Doc' });
    const docId = createRes.body.document.id;

    const res = await request(app).patch(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ title: 'New Title', content: 'New Content' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.document.title).toEqual('New Title');
    expect(res.body.document.content).toEqual('New Content');
  });

  it('should delete as owner', async () => {
    const createRes = await request(app).post('/api/documents').set('Authorization', `Bearer ${user1Token}`).send({ title: 'Doc' });
    const docId = createRes.body.document.id;

    const res = await request(app).delete(`/api/documents/${docId}`).set('Authorization', `Bearer ${user1Token}`);
    expect(res.statusCode).toEqual(204);

    const getRes = await request(app).get(`/api/documents/${docId}`).set('Authorization', `Bearer ${user1Token}`);
    expect(getRes.statusCode).toEqual(404);
  });

  it('should reject delete as non-owner', async () => {
    const createRes = await request(app).post('/api/documents').set('Authorization', `Bearer ${user1Token}`).send({ title: 'Doc' });
    const docId = createRes.body.document.id;

    const res = await request(app).delete(`/api/documents/${docId}`).set('Authorization', `Bearer ${user2Token}`);
    expect(res.statusCode).toEqual(403);
  });
});
