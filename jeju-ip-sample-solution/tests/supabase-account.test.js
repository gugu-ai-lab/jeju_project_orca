import test from 'node:test'
import assert from 'node:assert/strict'
import { AccountAuthError, createSupabaseAccount, isAnonymousUser } from '../services/supabase-account.js'

function fakeClient() {
  const calls = []
  const auth = Object.fromEntries([
    'getSession', 'signInWithPassword', 'signUp', 'updateUser', 'signOut',
  ].map(name => [name, async (...args) => {
    calls.push([name, ...args])
    return { data: { session: null, user: { id: 'test-user' } }, error: null }
  }]))
  return { client: { auth }, calls }
}

test('account registration, sign-in, and logout use the intended Supabase auth methods', async () => {
  const { client, calls } = fakeClient()
  const account = createSupabaseAccount(client)
  await account.signIn('student@example.test', 'password-123')
  await account.signUp('new@example.test', 'password-123', 'https://example.test/account?registered=1')
  await account.signOut()

  assert.deepEqual(calls, [
    ['signInWithPassword', { email: 'student@example.test', password: 'password-123' }],
    ['signUp', { email: 'new@example.test', password: 'password-123', options: { emailRedirectTo: 'https://example.test/account?registered=1' } }],
    ['signOut', { scope: 'local' }],
  ])
})

test('account service returns only safe Korean errors, never provider error text', async () => {
  const client = { auth: { signInWithPassword: async () => ({ error: new Error('private token or endpoint') }) } }
  await assert.rejects(createSupabaseAccount(client).signIn('x@example.test', 'bad'), error => {
    assert.ok(error instanceof AccountAuthError)
    assert.equal(error.code, 'LOGIN')
    assert.equal(error.message.includes('private token'), false)
    return true
  })
})

test('anonymous status is identified from the Supabase user flag', () => {
  assert.equal(isAnonymousUser({ is_anonymous: true }), true)
  assert.equal(isAnonymousUser({ is_anonymous: false }), false)
  assert.equal(isAnonymousUser(null), false)
})
