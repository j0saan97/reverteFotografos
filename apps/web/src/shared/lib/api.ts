import { supabase } from './supabase'

export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body: body as object })
  if (error) throw error
  return data as T
}
