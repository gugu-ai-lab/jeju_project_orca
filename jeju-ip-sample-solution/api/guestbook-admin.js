import { timingSafeEqual } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'
import { GUESTBOOK_TABLE } from '../services/guestbook.js'
import { FAVORITES_PROJECT_URL } from '../services/supabase-session.js'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function sameSecret(actual, expected) {
  if (typeof actual !== 'string' || typeof expected !== 'string') return false
  const a = Buffer.from(actual)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function configured(env) {
  return typeof env.GUESTBOOK_ADMIN_PASSWORD === 'string'
    && env.GUESTBOOK_ADMIN_PASSWORD.length >= 16
    && typeof env.SUPABASE_SERVICE_ROLE_KEY === 'string'
    && env.SUPABASE_SERVICE_ROLE_KEY.length > 0
}

export function createGuestbookAdminHandler({ env = process.env, makeClient = createClient } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('X-Content-Type-Options', 'nosniff')
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST 요청만 지원합니다.' })
    if (!configured(env)) return res.status(503).json({ error: '관리자 삭제 기능이 아직 서버에 설정되지 않았어요.' })

    const body = req.body
    if (!body || typeof body !== 'object' || Array.isArray(body)
      || Object.keys(body).some(key => !['action', 'password', 'postId'].includes(key))
      || typeof body.password !== 'string' || body.password.length > 512
      || !sameSecret(body.password, env.GUESTBOOK_ADMIN_PASSWORD)) {
      return res.status(401).json({ error: '관리자 비밀번호를 확인해 주세요.' })
    }
    if (body.action === 'verify') return res.status(200).json({ ok: true })
    if (body.action !== 'delete' || typeof body.postId !== 'string' || !UUID.test(body.postId)) {
      return res.status(400).json({ error: '삭제할 글 정보를 확인해 주세요.' })
    }

    try {
      const client = makeClient(FAVORITES_PROJECT_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
        auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
      })
      const { data, error } = await client.from(GUESTBOOK_TABLE)
        .delete().eq('id', body.postId).select('id').maybeSingle()
      if (error) return res.status(502).json({ error: '글을 삭제하지 못했어요. 데이터베이스 설정을 확인해 주세요.' })
      if (!data) return res.status(404).json({ error: '삭제할 글을 찾지 못했어요. 목록을 새로고침해 주세요.' })
      return res.status(200).json({ ok: true })
    } catch {
      return res.status(502).json({ error: '글을 삭제하지 못했어요. 잠시 후 다시 시도해 주세요.' })
    }
  }
}

export default createGuestbookAdminHandler()
