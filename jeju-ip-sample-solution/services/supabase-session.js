import { createClient } from '@supabase/supabase-js'

export const FAVORITES_PROJECT_URL = 'https://bhmffgtvdtfpneotjrty.supabase.co'
export const FAVORITES_TABLE = 'jeju_myth_favorites'
export const FAVORITES_STORAGE_KEY = 'jeju-myth-auth-bhmffgtvdtfpneotjrty-v1'

const messages = {
  WRONG_PROJECT: '즐겨찾기는 새 제주 전용 Supabase 프로젝트에서만 사용할 수 있습니다.',
  INVALID_PUBLISHABLE_KEY: 'Supabase Publishable key 설정을 확인해 주세요.',
  AUTH_UNAVAILABLE: '익명 인증을 시작하지 못했습니다. 익명 로그인 설정과 네트워크를 확인해 주세요.',
  SESSION_UNAVAILABLE: '기존 인증 세션을 확인하지 못했습니다. 자동으로 다른 사용자로 전환하지 않습니다.',
  REQUEST_BLOCKED: '허용되지 않은 프로젝트 또는 테이블 요청을 차단했습니다.',
}
export class FavoritesError extends Error {
  constructor(code, message = messages[code]) {
    super(message || '즐겨찾기 요청을 처리하지 못했습니다.')
    this.name = 'FavoritesError'
    this.code = code
  }
}
export function createMythSupabaseClient({
  url, publishableKey, storage, fetchImpl = globalThis.fetch,
  persistSession = true, autoRefreshToken = true,
}) {
  if (typeof url !== 'string' || url.trim().replace(/\/$/, '') !== FAVORITES_PROJECT_URL) throw new FavoritesError('WRONG_PROJECT')
  if (typeof publishableKey !== 'string' || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey.trim())) {
    throw new FavoritesError('INVALID_PUBLISHABLE_KEY')
  }
  const guardedFetch = (input, options = {}) => {
    const target = new URL(typeof input === 'string' || input instanceof URL ? input : input.url)
    const allowed = target.origin === FAVORITES_PROJECT_URL
      && (target.pathname.startsWith('/auth/v1/') || target.pathname === '/rest/v1/' + FAVORITES_TABLE)
    if (!allowed) throw new FavoritesError('REQUEST_BLOCKED')
    return fetchImpl(input, { ...options, redirect: 'error' })
  }
  return createClient(FAVORITES_PROJECT_URL, publishableKey.trim(), {
    auth: { persistSession, autoRefreshToken, detectSessionInUrl: false, storageKey: FAVORITES_STORAGE_KEY,
      debug: false, ...(storage ? { storage } : {}) },
    global: { fetch: guardedFetch },
  })
}

const pending = new WeakMap()
export function ensureFavoritesSession(client) {
  if (pending.has(client)) return pending.get(client)
  const task = (async () => {
    const current = await client.auth.getSession()
    if (current.error) throw new FavoritesError('SESSION_UNAVAILABLE')
    if (current.data.session) {
      const verified = await client.auth.getUser()
      if (verified.error || !verified.data.user || verified.data.user.id !== current.data.session.user.id) {
        throw new FavoritesError('SESSION_UNAVAILABLE')
      }
      return { userId: verified.data.user.id, isAnonymous: verified.data.user.is_anonymous === true }
    }
    const result = await client.auth.signInAnonymously()
    if (result.error || !result.data.user || !result.data.session) throw new FavoritesError('AUTH_UNAVAILABLE')
    return { userId: result.data.user.id, isAnonymous: result.data.user.is_anonymous === true }
  })().catch(error => {
    if (error instanceof FavoritesError) throw error
    throw new FavoritesError('AUTH_UNAVAILABLE')
  }).finally(() => pending.delete(client))
  pending.set(client, task)
  return task
}
