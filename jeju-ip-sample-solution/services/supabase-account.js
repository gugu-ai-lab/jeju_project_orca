const AUTH_MESSAGES = {
  SESSION: '계정 상태를 확인하지 못했습니다. 잠시 후 다시 시도해 주세요.',
  LOGIN: '로그인 정보를 확인해 주세요.',
  SIGNUP: '회원가입을 처리하지 못했습니다. 이메일 주소와 비밀번호를 확인해 주세요.',
  LINK: '이메일 연결을 시작하지 못했습니다. Supabase에서 익명 사용자 계정 연결 설정을 확인해 주세요.',
  PASSWORD: '비밀번호를 설정하지 못했습니다. 이메일 인증을 완료했는지 확인해 주세요.',
  LOGOUT: '로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요.',
}

export class AccountAuthError extends Error {
  constructor(code, message = AUTH_MESSAGES[code] || '계정 요청을 처리하지 못했습니다.') {
    super(message)
    this.name = 'AccountAuthError'
    this.code = code
  }
}

function resultOrThrow(result, code) {
  if (result?.error) throw new AccountAuthError(code)
  return result?.data
}

export function createSupabaseAccount(client) {
  return {
    async getSession() {
      return resultOrThrow(await client.auth.getSession(), 'SESSION')?.session || null
    },
    async signIn(email, password) {
      return resultOrThrow(await client.auth.signInWithPassword({ email, password }), 'LOGIN')
    },
    async signUp(email, password, emailRedirectTo) {
      return resultOrThrow(await client.auth.signUp({
        email,
        password,
        options: { emailRedirectTo },
      }), 'SIGNUP')
    },
    async linkAnonymousEmail(email, emailRedirectTo) {
      return resultOrThrow(await client.auth.updateUser(
        { email },
        { emailRedirectTo },
      ), 'LINK')
    },
    async setPassword(password) {
      return resultOrThrow(await client.auth.updateUser({ password }), 'PASSWORD')
    },
    async signOut() {
      resultOrThrow(await client.auth.signOut({ scope: 'local' }), 'LOGOUT')
    },
  }
}

export function isAnonymousUser(user) {
  return user?.is_anonymous === true
}
