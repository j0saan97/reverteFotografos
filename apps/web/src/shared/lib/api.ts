import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from './supabase'

// Error returned by an Edge Function: `code` is the function's `error` field
// and `data` the full JSON body (some functions add details).
export class FunctionError extends Error {
  constructor(
    readonly code: string,
    readonly status: number,
    readonly data: Record<string, unknown> = {},
  ) {
    super(code)
    this.name = 'FunctionError'
  }
}

export async function callFunction<T>(name: string, body: unknown): Promise<T> {
  const { data, error } = await supabase.functions.invoke<T>(name, { body: body as object })
  if (error instanceof FunctionsHttpError) {
    const res = error.context as Response
    const payload = (await res.json().catch(() => ({}))) as Record<string, unknown>
    throw new FunctionError(String(payload.error ?? 'unknown'), res.status, payload)
  }
  if (error) throw error
  return data as T
}
