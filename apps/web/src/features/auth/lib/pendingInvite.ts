// Remembers an invitation link while the client signs in or registers
// (email confirmation leaves the app, so router state would be lost).
const KEY = 'pendingInviteToken'

export const pendingInvite = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(KEY, token)
    } catch {
      // Private mode / blocked storage: the user can open the link again
    }
  },
  clear() {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // ignore
    }
  },
  path: (token: string) => `/invite/${token}`,
}
