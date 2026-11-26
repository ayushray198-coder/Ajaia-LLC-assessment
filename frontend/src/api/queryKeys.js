export const queryKeys = {
  users: ['users'],
  currentUser: (demoId) => ['currentUser', demoId],
  documents: (demoId, search = '') => ['documents', demoId, search],
  document: (demoId, id) => ['document', demoId, id],
}
