import test from 'node:test'
import assert from 'node:assert/strict'
import { createMythFavorites } from '../services/myth-favorites.js'
import { FAVORITES_PROJECT_URL, FAVORITES_TABLE } from '../services/supabase-session.js'

const row={id:'favorite-a',user_id:'user-a',story_id:'story-a',story_title:'이야기 A',created_at:'2026-11-02T00:00:00Z'}
function fakeClient(results) {
  const calls=[]
  const client={supabaseUrl:FAVORITES_PROJECT_URL,auth:{
    getSession:async()=>({data:{session:{user:{id:'user-a'}}}}),
    getUser:async()=>({data:{user:{id:'user-a',is_anonymous:true}}}),
  },from(table){
    assert.equal(table,FAVORITES_TABLE)
    const builder={}
    for(const method of ['insert','select','eq','order','delete']) builder[method]=(...args)=>{calls.push({method,args});return builder}
    builder.single=async()=>results.shift()
    return builder
  }}
  return {client,calls}
}
test('save inserts only allowed columns and returns normalized favorite',async()=>{
  const {client,calls}=fakeClient([{data:row}])
  const result=await createMythFavorites(client).save({storyId:' story-a ',storyTitle:' 이야기 A '})
  assert.equal(result.created,true);assert.equal(result.favorite.storyId,'story-a')
  assert.deepEqual(calls.find(c=>c.method==='insert').args,[{story_id:'story-a',story_title:'이야기 A'}])
})
test('duplicate save reads existing row instead of updating ownership or title',async()=>{
  const {client,calls}=fakeClient([{error:{code:'23505'}},{data:row}])
  const result=await createMythFavorites(client).save({storyId:'story-a',storyTitle:'다른 제목'})
  assert.equal(result.created,false);assert.equal(result.favorite.storyTitle,'이야기 A')
  assert.ok(calls.some(c=>c.method==='eq'&&c.args[0]==='user_id'&&c.args[1]==='user-a'))
})
test('invalid or forged fields are rejected before authentication or insertion',async()=>{
  const {client,calls}=fakeClient([])
  const favorites=createMythFavorites(client)
  await assert.rejects(favorites.save({storyId:'story-a',storyTitle:'A',userId:'user-b'}),e=>e.code==='INVALID_STORY')
  await assert.rejects(favorites.save({storyId:'',storyTitle:'A'}),e=>e.code==='INVALID_STORY')
  assert.equal(calls.length,0)
})
test('database error message is sanitized',async()=>{
  const {client}=fakeClient([{error:{code:'42501',message:'private token value'}}])
  await assert.rejects(createMythFavorites(client).save({storyId:'story-a',storyTitle:'A'}),e=>e.code==='ACCESS_DENIED'&&!e.message.includes('private'))
})
test('client of another project is rejected',()=>{
  assert.throws(()=>createMythFavorites({supabaseUrl:'https://old-project.supabase.co'}),e=>e.code==='WRONG_PROJECT')
})
