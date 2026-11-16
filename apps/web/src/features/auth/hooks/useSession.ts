// TODO (F1): suscribirse a supabase.auth.onAuthStateChange y exponer { session, profile, loading }
export function useSession() {
  return { session: null, profile: null, loading: false }
}
