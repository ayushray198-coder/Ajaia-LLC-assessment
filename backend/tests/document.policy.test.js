import test from 'node:test'
import assert from 'node:assert/strict'
import { canDeleteDocument, canEditDocument, canReadDocument, canShareDocument } from '../src/modules/documents/document.policy.js'

const owner = { _id: 'owner-id' }
const sharedUser = { _id: 'shared-id' }
const stranger = { _id: 'stranger-id' }
const document = { owner, sharedWith: [sharedUser] }
const viewerDocument = {
  ...document,
  sharedPermissions: [{ user: sharedUser, role: 'viewer' }],
}

test('owner and shared user can read and edit, while an unshared user cannot', () => {
  assert.equal(canReadDocument(document, owner), true)
  assert.equal(canEditDocument(document, owner), true)
  assert.equal(canReadDocument(document, sharedUser), true)
  assert.equal(canEditDocument(document, sharedUser), true)
  assert.equal(canReadDocument(document, stranger), false)
  assert.equal(canEditDocument(document, stranger), false)
})

test('only the owner can delete or share a document', () => {
  assert.equal(canDeleteDocument(document, owner), true)
  assert.equal(canShareDocument(document, owner), true)
  assert.equal(canDeleteDocument(document, sharedUser), false)
  assert.equal(canShareDocument(document, sharedUser), false)
})

test('viewer collaborators can read but cannot edit, delete, or share', () => {
  assert.equal(canReadDocument(viewerDocument, sharedUser), true)
  assert.equal(canEditDocument(viewerDocument, sharedUser), false)
  assert.equal(canDeleteDocument(viewerDocument, sharedUser), false)
  assert.equal(canShareDocument(viewerDocument, sharedUser), false)
})

test('revoked collaborators lose access immediately', () => {
  const afterRevoke = { ...document, sharedWith: document.sharedWith.filter((user) => user._id !== sharedUser._id) }
  assert.equal(canReadDocument(afterRevoke, sharedUser), false)
  assert.equal(canEditDocument(afterRevoke, sharedUser), false)
})
