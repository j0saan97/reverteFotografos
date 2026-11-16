import { useContext } from 'react'
import { AuthContext, type AuthState } from '../context/authContext'

export function useSession(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useSession must be used inside <AuthProvider>')
  return ctx
}
