import { FAVORITES_PROJECT_URL, FAVORITES_TABLE, FavoritesError, ensureFavoritesSession } from './supabase-session.js'

export const FAVORITE_COLUMNS = 'id,user_id,story_id,story_title,created_at'
const messages = {
  INVALID_STORY: '이야기 고유 ID는 128자, 제목은 200자 이내로 입력해 주세요.',
  TABLE_NOT_READY: '신화 즐겨찾기 테이블 설정을 확인해 주세요.',
  ACCESS_DENIED: '본인의 즐겨찾기만 사용할 수 있습니다. 인증 및 RLS 설정을 확인해 주세요.',
  DATABASE_UNAVAILABLE: '즐겨찾기 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.',
}
function databaseError(error) {
  const code = ['42P01', 'PGRST205'].includes(error?.code) ? 'TABLE_NOT_READY'
    : error?.code === '42501' ? 'ACCESS_DENIED' : 'DATABASE_UNAVAILABLE'
  return new FavoritesError(code, messages[code])
}
function validStoryId(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 128) throw new FavoritesError('INVALID_STORY', messages.INVALID_STORY)
  return value.trim()
}
function mapRow(row) {
  return { id: row.id, userId: row.user_id, storyId: row.story_id, storyTitle: row.story_title, createdAt: row.created_at }
}
export function createMythFavorites(client) {
  if (client?.supabaseUrl?.replace(/\/$/, '') !== FAVORITES_PROJECT_URL) throw new FavoritesError('WRONG_PROJECT')
  return {
    ensureSession: () => ensureFavoritesSession(client),
    async list() {
      const { userId } = await ensureFavoritesSession(client)
      let result
      try {
        result = await client.from(FAVORITES_TABLE).select(FAVORITE_COLUMNS)
          .eq('user_id', userId).order('created_at', { ascending: false }).order('id', { ascending: false })
      } catch (error) { throw databaseError(error) }
      if (result.error) throw databaseError(result.error)
      const rows = result.data || []
      if (rows.some(row => row.user_id !== userId)) throw new FavoritesError('ACCESS_DENIED', messages.ACCESS_DENIED)
      return rows.map(mapRow)
    },

    async save(input) {
      if (!input || Object.keys(input).some(k => !['storyId', 'storyTitle'].includes(k))) throw new FavoritesError('INVALID_STORY', messages.INVALID_STORY)
      const storyId = validStoryId(input.storyId)
      if (typeof input.storyTitle !== 'string' || !input.storyTitle.trim() || input.storyTitle.trim().length > 200) {
        throw new FavoritesError('INVALID_STORY', messages.INVALID_STORY)
      }
      const { userId } = await ensureFavoritesSession(client)
      let result
      try {
        result = await client.from(FAVORITES_TABLE)
          .insert({ story_id: storyId, story_title: input.storyTitle.trim() })
          .select(FAVORITE_COLUMNS).single()
        if (result.error?.code === '23505') {
          const existing = await client.from(FAVORITES_TABLE).select(FAVORITE_COLUMNS)
            .eq('user_id', userId).eq('story_id', storyId).single()
          if (existing.error) throw databaseError(existing.error)
          return { favorite: mapRow(existing.data), created: false }
        }
      } catch (error) {
        if (error instanceof FavoritesError) throw error
        throw databaseError(error)
      }
      if (result.error) throw databaseError(result.error)
      if (result.data.user_id !== userId) throw new FavoritesError('ACCESS_DENIED', messages.ACCESS_DENIED)
      return { favorite: mapRow(result.data), created: true }
    },
  }
}
