// 수동 실검증 전용. 새 익명 사용자 2명 생성 및 이번 테스트 행만 저장/삭제한다.
// 키/토큰/사용자 ID는 출력하지 않는다. 관리자 키·OpenAI·기존 수업 DB는 사용하지 않는다.
import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { randomUUID } from 'node:crypto'
import { createMythSupabaseClient, FAVORITES_TABLE } from '../services/supabase-session.js'
import { createMythFavorites, FAVORITE_COLUMNS } from '../services/myth-favorites.js'

const env = parseEnv(readFileSync(new URL('../.env.local', import.meta.url), 'utf8'))
const config = { url: env.VITE_SUPABASE_URL, publishableKey: env.VITE_SUPABASE_ANON_KEY, autoRefreshToken: false }
const memory = () => {
  const entries = new Map()
  return { getItem: k => entries.get(k) ?? null, setItem: (k, v) => entries.set(k, v), removeItem: k => entries.delete(k) }
}
const storageA = memory()
const a = createMythSupabaseClient({ ...config, storage: storageA })
const b = createMythSupabaseClient({ ...config, storage: memory() })
const fa = createMythFavorites(a), fb = createMythFavorites(b)
const storyId = 'codex-favorites-audit-' + randomUUID()
const forgedStory = storyId + '-forged'
const checks = {}
let ua, ub
function check(name, condition) {
  checks[name] = Boolean(condition)
  if (!condition) throw new Error('CHECK_FAILED')
}
try {
  ua = await fa.ensureSession(); ub = await fb.ensureSession()
  check('anonymousUsersAreDistinct', ua.isAnonymous && ub.isAnonymous && ua.userId !== ub.userId)
  const table = await a.from(FAVORITES_TABLE).select(FAVORITE_COLUMNS).limit(0)
  check('tableAndColumnsAccessible', !table.error)
  const sa = await fa.save({ storyId, storyTitle: '익명 사용자 A 검증용 이야기' })
  const sb = await fb.save({ storyId, storyTitle: '익명 사용자 B 검증용 이야기' })
  check('saveAndOwnerDefaults', sa.created && sb.created && sa.favorite.userId === ua.userId && sb.favorite.userId === ub.userId)
  const duplicate = await fa.save({ storyId, storyTitle: '중복 저장' })
  check('duplicateIsIdempotent', !duplicate.created && duplicate.favorite.id === sa.favorite.id)
  check('ownListsAreIsolated', (await fa.list()).filter(r => r.storyId === storyId).length === 1
    && (await fb.list()).filter(r => r.storyId === storyId).length === 1)
  // 새 SDK 인스턴스에서 저장된 세션 재사용. 실제 브라우저 새로고침은 별도로 검증.
  const restored = createMythFavorites(createMythSupabaseClient({ ...config, storage: storageA }))
  check('storedSessionReused', (await restored.ensureSession()).userId === ua.userId)
  check('savedDataSurvivesClientRecreation', (await restored.list()).some(r => r.id === sa.favorite.id))
  // 여기부터는 서비스의 소유자 필터를 빼고 실제 DB RLS 자체를 검사한다.
  const allTestRows = await b.from(FAVORITES_TABLE).select('id,user_id').eq('story_id', storyId)
  check('databaseSelectPolicyIsolatesUsers', !allTestRows.error && allTestRows.data.length === 1 && allTestRows.data[0].user_id === ub.userId)
  const foreignRead = await b.from(FAVORITES_TABLE).select('id').eq('id', sa.favorite.id)
  check('foreignReadReturnsZeroRows', !foreignRead.error && foreignRead.data.length === 0)
  const foreignDelete = await b.from(FAVORITES_TABLE).delete().eq('id', sa.favorite.id).select('id')
  check('foreignDeleteAffectsZeroRows', !foreignDelete.error && foreignDelete.data.length === 0)
  check('ownerRowSurvivesForeignDelete', (await fa.list()).some(r => r.id === sa.favorite.id))
  const forged = await b.from(FAVORITES_TABLE).insert({ user_id: ua.userId, story_id: forgedStory, story_title: '소유자 위조 검증' })
  check('forgedOwnerInsertDenied', Boolean(forged.error) && forged.error.code === '42501')
  const update = await b.from(FAVORITES_TABLE).update({ story_title: '수정 거부 검증' }).eq('id', sb.favorite.id)
  check('updateDenied', Boolean(update.error) && update.error.code === '42501')
  const unsigned = createMythSupabaseClient({ ...config, persistSession: false })
  const noAuth = await unsigned.from(FAVORITES_TABLE).select('id').eq('story_id', storyId)
  check('unauthenticatedReadDenied', Boolean(noAuth.error) && noAuth.error.code === '42501')
  check('ownDeleteAllowed', (await fa.remove(storyId)).deletedCount === 1 && (await fb.remove(storyId)).deletedCount === 1)
  check('deletedRowsAbsent', !(await fa.list()).some(r => r.storyId === storyId) && !(await fb.list()).some(r => r.storyId === storyId))
  console.log(JSON.stringify({ status: 'passed', checks, adminKeyUsed: false, openAIRequests: 0 }))
} catch (error) {
  console.log(JSON.stringify({ status: 'failed', checks, code: error.code || 'CHECK_FAILED', adminKeyUsed: false, openAIRequests: 0 }))
  process.exitCode = 1
} finally {
  let cleanupOK = true
  for (const [client, user] of [[a, ua], [b, ub]]) {
    if (!user) continue
    const result = await client.from(FAVORITES_TABLE).delete().eq('user_id', user.userId).in('story_id', [storyId, forgedStory]).select('id')
    if (result.error) cleanupOK = false
  }
  console.log(JSON.stringify({ ownTestRowsCleanupSucceeded: cleanupOK, unrelatedRowsTouched: false }))
  if (!cleanupOK) process.exitCode = 1
}
