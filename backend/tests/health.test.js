import test from 'node:test'
import assert from 'node:assert/strict'
import request from 'supertest'
import mongoose from 'mongoose'

process.env.NODE_ENV = 'test'
const { createApp } = await import('../src/app.js')

test('health endpoint safely reports a disconnected database', async () => {
  assert.equal(mongoose.connection.readyState, 0)
  const response = await request(createApp()).get('/api/health')
  assert.equal(response.status, 503)
  assert.deepEqual(response.body, {
    success: false,
    data: { status: 'unavailable', database: 'disconnected' },
  })
  assert.ok(response.headers['x-content-type-options'])
})

test('CORS preflight allows bearer-authenticated frontend requests', async () => {
  const response = await request(createApp())
    .options('/api/documents')
    .set('Origin', 'http://localhost:5173')
    .set('Access-Control-Request-Method', 'GET')
    .set('Access-Control-Request-Headers', 'authorization,content-type')

  assert.equal(response.status, 204)
  assert.equal(response.headers['access-control-allow-origin'], 'http://localhost:5173')
  assert.match(response.headers['access-control-allow-headers'], /Authorization/i)
})

test('CORS preflight allows the deployed Vercel frontend', async () => {
  const response = await request(createApp())
    .options('/api/documents')
    .set('Origin', 'https://ajaia-llc-assessment.vercel.app')
    .set('Access-Control-Request-Method', 'GET')
    .set('Access-Control-Request-Headers', 'authorization,content-type')

  assert.equal(response.status, 204)
  assert.equal(response.headers['access-control-allow-origin'], 'https://ajaia-llc-assessment.vercel.app')
})

test('demo identity middleware rejects arbitrary user identifiers', async () => {
  const response = await request(createApp()).get('/api/auth/me').set('X-Demo-User', 'not-a-demo-user')
  assert.equal(response.status, 401)
  assert.equal(response.body.code, 'INVALID_DEMO_USER')
})

test('malformed JSON receives a safe client error', async () => {
  const response = await request(createApp())
    .post('/api/auth/switch')
    .set('Content-Type', 'application/json')
    .send('{invalid json')
  assert.equal(response.status, 400)
  assert.equal(response.body.code, 'INVALID_JSON')
})
