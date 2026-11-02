import test from 'node:test'
import assert from 'node:assert/strict'
import { STORY_CATALOG, HOME_STORIES, VERIFIED_PLACE_COUNT } from '../src/data/storyCatalog.js'
import { STUDENT_STORIES } from '../src/data/studentStories.js'
import { filterStories, mergeCatalog } from '../src/lib/storyFilter.js'
const ids = ['seolmundae','samsinin','honinji','suwolbong','sanbangdeok','yeongdeung','jacheongbi']
test('home and default explorer share the same seven verified unique story IDs', () => {
  assert.deepEqual(HOME_STORIES.map(s=>s.id), ids)
  assert.deepEqual(filterStories(STORY_CATALOG,{onlyVerified:true}).map(s=>s.id),ids)
  assert.equal(new Set(STORY_CATALOG.map(s=>s.id)).size,STORY_CATALOG.length)
  assert.equal(VERIFIED_PLACE_COUNT,6)
  assert.equal(STORY_CATALOG.find(s=>s.id==='samsinin').title,'삼성혈')
  assert.equal(STORY_CATALOG.find(s=>s.id==='samsinin').mapPin.shortPlace,'제주 삼성혈')
})
test('migration preserves every existing scene, title and source without inventing stories', () => {
  for(const before of STUDENT_STORIES) {
    const after=STORY_CATALOG.find(s=>s.id===before.id)
    assert.equal(after.title,before.title);assert.deepEqual(after.scenes,before.scenes)
    assert.deepEqual(after.source,before.source);assert.ok(after.scenes.length)
    assert.equal(after.verificationDocument,'MYTH_CONTENT_VERIFICATION.md')
  }
})
test('global myth remains searchable; images filter is explicit; old title aliases work', () => {
  const result=filterStories(STORY_CATALOG,{query:'자청비',onlyVerified:true})
  assert.equal(result[0].id,'jacheongbi');assert.equal(result[0].mapPin.hasLocation,false)
  assert.equal(result[0].mapPin.lat,undefined)
  assert.equal(filterStories(STORY_CATALOG,{query:'삼신인의 혼인'})[0].id,'honinji')
  assert.equal(filterStories(STORY_CATALOG,{onlyWithImage:true}).length,2)
})
test('updating metadata deduplicates same ID without deleting existing scenes', () => {
  const merged=mergeCatalog(STORY_CATALOG,[{id:'honinji',title:'혼인지',summary:'기존 항목 메타데이터 갱신'}])
  assert.equal(merged.length,STORY_CATALOG.length)
  assert.deepEqual(merged.find(s=>s.id==='honinji').scenes,STORY_CATALOG.find(s=>s.id==='honinji').scenes)
})
