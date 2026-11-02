import test from 'node:test'
import assert from 'node:assert/strict'
import { createMythSupabaseClient, ensureFavoritesSession, FAVORITES_PROJECT_URL } from '../services/supabase-session.js'

test('rejects old project and secret keys before any network call',()=>{
  let calls=0
  const fetchImpl=()=>{calls++;throw Error('Unexpected network')}
  assert.throws(()=>createMythSupabaseClient({url:'https://old-project.supabase.co',publishableKey:'sb_publishable_test',fetchImpl}),e=>e.code==='WRONG_PROJECT')
  assert.throws(()=>createMythSupabaseClient({url:FAVORITES_PROJECT_URL,publishableKey:'sb_secret_test',fetchImpl}),e=>e.code==='INVALID_PUBLISHABLE_KEY')
  assert.equal(calls,0)
})
test('concurrent session requests create only one anonymous user and never expose tokens',async()=>{
  let signups=0
  const client={auth:{
    getSession:async()=>({data:{session:null}}),
    signInAnonymously:async()=>{signups++;return {data:{user:{id:'user-a',is_anonymous:true},session:{access_token:'test-token'}}}},
  }}
  const result=await Promise.all([ensureFavoritesSession(client),ensureFavoritesSession(client)])
  assert.equal(signups,1);assert.deepEqual(result[0],{userId:'user-a',isAnonymous:true})
  assert.equal(JSON.stringify(result).includes('test-token'),false)
})
test('existing session is verified and retained without creating a new user',async()=>{
  const client={auth:{
    getSession:async()=>({data:{session:{user:{id:'user-a'}}}}),
    getUser:async()=>({data:{user:{id:'user-a',is_anonymous:true}}}),
    signInAnonymously:async()=>{throw Error('Must not sign in again')},
  }}
  assert.equal((await ensureFavoritesSession(client)).userId,'user-a')
})
test('invalid saved session fails closed instead of silently losing ownership',async()=>{
  const client={auth:{
    getSession:async()=>({data:{session:{user:{id:'user-a'}}}}),
    getUser:async()=>({error:{message:'private response'},data:{user:null}}),
    signInAnonymously:async()=>{throw Error('Must not replace session')},
  }}
  await assert.rejects(ensureFavoritesSession(client),e=>e.code==='SESSION_UNAVAILABLE'&&!e.message.includes('private'))
})
test('network error is sanitized',async()=>{
  await assert.rejects(ensureFavoritesSession({auth:{getSession:async()=>{throw Error('private endpoint token')}}}),e=>e.code==='AUTH_UNAVAILABLE'&&!e.message.includes('private'))
})
