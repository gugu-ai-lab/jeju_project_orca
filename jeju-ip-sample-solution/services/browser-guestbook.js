import { ensureMythFavoritesSession, getMythSupabaseClient, isSupabasePreviewReadOnly } from './browser-favorites.js'
import { createGuestbookService } from './guestbook.js'

let service

function getService() {
  if (!service) service = createGuestbookService(getMythSupabaseClient(), { ensureSession: ensureMythFavoritesSession })
  return service
}

export const listGuestbookPosts = () => getService().list()
export async function addGuestbookPost(input) {
  if (isSupabasePreviewReadOnly()) throw new Error('안전 미리보기에서는 방명록에 글을 올릴 수 없습니다.')
  return getService().add(input)
}
