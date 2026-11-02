// Claude 화면에서 사용할 브라우저 전용 진입점. 기존 UI/Store와 독립적이다.
import { createMythSupabaseClient } from './supabase-session.js'
import { createMythFavorites } from './myth-favorites.js'

let shared
export function getMythFavorites() {
  if (!shared) {
    shared = createMythFavorites(createMythSupabaseClient({
      url: import.meta.env?.VITE_SUPABASE_URL,
      publishableKey: import.meta.env?.VITE_SUPABASE_ANON_KEY,
    }))
  }
  return shared
}
export const ensureMythFavoritesSession = () => getMythFavorites().ensureSession()
export const saveMythFavorite = input => getMythFavorites().save(input)
export const listMythFavorites = () => getMythFavorites().list()
export const deleteMythFavorite = storyId => getMythFavorites().remove(storyId)
