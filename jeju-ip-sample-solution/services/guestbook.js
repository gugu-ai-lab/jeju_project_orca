import { FAVORITES_PROJECT_URL } from './supabase-session.js'

export const GUESTBOOK_TABLE = 'jeju_guestbook'
export const GUESTBOOK_COLUMNS = 'id,nickname,message,created_at'
const MAX_POSTS_PER_PAGE = 50

const messages = {
  INVALID_POST: '별명은 1~16자, 글은 1~300자로 입력해 주세요.',
  TABLE_NOT_READY: '방명록 테이블이 아직 준비되지 않았어요.',
  ACCESS_DENIED: '방명록 권한 설정을 확인해 주세요.',
  RATE_LIMITED: '한 번에 여러 글을 올릴 수 없어요. 잠시 뒤 다시 써 주세요.',
  UNAVAILABLE: '방명록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.',
}

export class GuestbookError extends Error {
  constructor(code) {
    super(messages[code] || messages.UNAVAILABLE)
    this.name = 'GuestbookError'
    this.code = code
  }
}

function databaseError(error) {
  const code = ['42P01', 'PGRST205'].includes(error?.code) ? 'TABLE_NOT_READY'
    : error?.code === 'P0001' ? 'RATE_LIMITED'
    : ['42501', 'PGRST301'].includes(error?.code) ? 'ACCESS_DENIED'
      : 'UNAVAILABLE'
  return new GuestbookError(code)
}

function validPost(input) {
  if (!input || Object.keys(input).some(key => !['nickname', 'message'].includes(key))) throw new GuestbookError('INVALID_POST')
  const nickname = typeof input.nickname === 'string' ? input.nickname.trim() : ''
  const message = typeof input.message === 'string' ? input.message.trim() : ''
  const nicknameLength = Array.from(nickname).length
  const messageLength = Array.from(message).length
  if (nicknameLength < 1 || nicknameLength > 16 || messageLength < 1 || messageLength > 300) throw new GuestbookError('INVALID_POST')
  return { nickname, message }
}

function normalizeRow(row) {
  return { id: row.id, nickname: row.nickname, message: row.message, createdAt: row.created_at }
}

export function createGuestbookService(client, { ensureSession = async () => {} } = {}) {
  if (client?.supabaseUrl?.replace(/\/$/, '') !== FAVORITES_PROJECT_URL) throw new GuestbookError('ACCESS_DENIED')
  return {
    async list(limit = MAX_POSTS_PER_PAGE) {
      let result
      try {
        result = await client.from(GUESTBOOK_TABLE).select(GUESTBOOK_COLUMNS)
          .order('created_at', { ascending: false }).limit(Math.min(Math.max(limit, 1), MAX_POSTS_PER_PAGE))
      } catch (error) { throw databaseError(error) }
      if (result.error) throw databaseError(result.error)
      return (result.data || []).map(normalizeRow)
    },
    async add(input) {
      const post = validPost(input)
      await ensureSession()
      let result
      try {
        result = await client.from(GUESTBOOK_TABLE).insert(post).select(GUESTBOOK_COLUMNS).single()
      } catch (error) { throw databaseError(error) }
      if (result.error) throw databaseError(result.error)
      return normalizeRow(result.data)
    },
  }
}
