let adminPassword = ''
const listeners = new Set()

export function getGuestbookAdminPassword() {
  return adminPassword
}

export function subscribeGuestbookAdmin(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setGuestbookAdminPassword(value) {
  adminPassword = value
  listeners.forEach(listener => listener())
}

export function clearGuestbookAdminPassword() {
  if (!adminPassword) return
  adminPassword = ''
  listeners.forEach(listener => listener())
}
