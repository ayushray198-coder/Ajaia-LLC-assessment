import * as userRepository from './user.repository.js'

export const demoUsers = [
  { name: 'Ayush', email: 'ayush@draftly.demo', demoId: 'ayush', initials: 'AY' },
  { name: 'Rahul', email: 'rahul@draftly.demo', demoId: 'rahul', initials: 'RA' },
  { name: 'Priya', email: 'priya@draftly.demo', demoId: 'priya', initials: 'PR' },
]

export async function seedDemoUsers() {
  await Promise.all(demoUsers.map((user) => userRepository.upsertDemoUser(user)))
}

export async function listDemoUsers() {
  return userRepository.listUsers()
}
