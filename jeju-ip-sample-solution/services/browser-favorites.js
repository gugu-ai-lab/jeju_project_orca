// Claude 화면에서 사용할 브라우저 전용 진입점. 기존 UI/Store와 독립적이다.
import { FavoritesError, createMythSupabaseClient } from './supabase-session.js'
import { createMythFavorites } from './myth-favorites.js'

let shared
let sharedClient

export function isSupabasePreviewReadOnly() {
  return import.meta.env?.VITE_INTEGRATION_READ_ONLY === 'true'
}

export function getMythSupabaseClient() {
  if (!sharedClient) {
    sharedClient = createMythSupabaseClient({
      url: import.meta.env?.VITE_SUPABASE_URL,
      publishableKey: import.meta.env?.VITE_SUPABASE_ANON_KEY,
    })
  }
  return sharedClient
}

export function getMythFavorites() {
  if (isSupabasePreviewReadOnly()) {
    throw new FavoritesError('PREVIEW_READ_ONLY', '안전 미리보기에서는 즐겨찾기의 실제 인증·저장·조회·삭제를 실행하지 않습니다.')
  }
  if (!shared) shared = createMythFavorites(getMythSupabaseClient())
  return shared
}
export const ensureMythFavoritesSession = () => getMythFavorites().ensureSession()
export const saveMythFavorite = input => getMythFavorites().save(input)
export const listMythFavorites = () => getMythFavorites().list()
export const deleteMythFavorite = storyId => getMythFavorites().remove(storyId)
