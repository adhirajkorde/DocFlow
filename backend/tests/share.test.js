const request = require('supertest');
const app = require('../src/app');

describe('Share Endpoints', () => {
  let ownerToken, ownerId;
  let user2Token, user2Email, user2Id;
  let docId;

  beforeEach(async () => {
    const res1 = await request(app).post('/api/auth/register').send({ email: 'owner@test.com', password: 'password', name: 'Owner' });
    ownerToken = res1.body.token;
    ownerId = res1.body.user.id;

    const res2 = await request(app).post('/api/auth/register').send({ email: 'user2@test.com', password: 'password', name: 'User 2' });
    user2Token = res2.body.token;
    user2Email = res2.body.user.email;
    user2Id = res2.body.user.id;

    const createRes = await request(app).post('/api/documents').set('Authorization', `Bearer ${ownerToken}`).send({ title: 'Shared Doc' });
    docId = createRes.body.document.id;
  });

  it('should share a document with a valid user at view', async () => {
    const res = await request(app)
      .post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: user2Email, permission: 'view' });
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.share.permission).toEqual('view');
  });

  it('should verify listSharedWithMe reflects it for recipient', async () => {
    await request(app).post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: user2Email, permission: 'edit' });

    const res = await request(app).get('/api/documents/shared-with-me').set('Authorization', `Bearer ${user2Token}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.documents.length).toEqual(1);
    expect(res.body.documents[0].id).toEqual(docId);
    expect(res.body.documents[0].permission).toEqual('edit');
  });

  it('should reject view user from PATCHing', async () => {
    await request(app).post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: user2Email, permission: 'view' });

    const res = await request(app).patch(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'hacked' });
    
    expect(res.statusCode).toEqual(403);
  });

  it('should allow edit user to PATCH content but reject renaming title', async () => {
    await request(app).post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: user2Email, permission: 'edit' });

    // Should succeed on content
    const patchContent = await request(app).patch(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ content: 'edited content' });
    expect(patchContent.statusCode).toEqual(200);

    // Should fail on title
    const patchTitle = await request(app).patch(`/api/documents/${docId}`)
      .set('Authorization', `Bearer ${user2Token}`)
      .send({ title: 'hacked title' });
    expect(patchTitle.statusCode).toEqual(403);
  });

  it('should revoke access and verify document disappears', async () => {
    await request(app).post(`/api/documents/${docId}/share`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ email: user2Email, permission: 'view' });

    // Revoke
    const revokeRes = await request(app).delete(`/api/documents/${docId}/share/${user2Id}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(revokeRes.statusCode).toEqual(204);

    // Verify GET 403s
    const getRes = await request(app).get(`/api/documents/${docId}`).set('Authorization', `Bearer ${user2Token}`);
    expect(getRes.statusCode).toEqual(403);

    // Verify listSharedWithMe is empty
    const listRes = await request(app).get('/api/documents/shared-with-me').set('Authorization', `Bearer ${user2Token}`);
    expect(listRes.body.documents.length).toEqual(0);
  });
});
