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

async function guestbookAdminRequest(payload) {
  const response = await fetch('/api/guestbook-admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify(payload),
  })
  let data
  try { data = await response.json() } catch { data = null }
  if (!response.ok) throw new Error(data?.error || '관리자 요청을 처리하지 못했어요.')
  return data
}

export const verifyGuestbookAdmin = password => guestbookAdminRequest({ action: 'verify', password })
export const deleteGuestbookPost = (password, postId) => guestbookAdminRequest({ action: 'delete', password, postId })
