export const PENDING_FAVORITE_TRANSFER_KEY = 'jeju-account-pending-favorite-transfer-v1'

export function normalizeFavoriteTransfer(rows) {
  if (!Array.isArray(rows)) return []
  return rows.slice(0, 100).flatMap(row => {
    const storyId = typeof row?.storyId === 'string' ? row.storyId.trim().slice(0, 128) : ''
    const storyTitle = typeof row?.storyTitle === 'string' ? row.storyTitle.trim().slice(0, 200) : ''
    return storyId && storyTitle ? [{ storyId, storyTitle }] : []
  })
}

export function storeFavoriteTransfer(storage, rows) {
  const safeRows = normalizeFavoriteTransfer(rows)
  if (!safeRows.length) {
    storage.removeItem(PENDING_FAVORITE_TRANSFER_KEY)
    return 0
  }
  storage.setItem(PENDING_FAVORITE_TRANSFER_KEY, JSON.stringify(safeRows))
  return safeRows.length
}

export function readFavoriteTransfer(storage) {
  const raw = storage.getItem(PENDING_FAVORITE_TRANSFER_KEY)
  if (!raw) return []
  try { return normalizeFavoriteTransfer(JSON.parse(raw)) }
  catch {
    storage.removeItem(PENDING_FAVORITE_TRANSFER_KEY)
    return []
  }
}

export function clearFavoriteTransfer(storage) {
  storage.removeItem(PENDING_FAVORITE_TRANSFER_KEY)
}
