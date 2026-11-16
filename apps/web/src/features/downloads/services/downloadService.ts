import { callFunction } from '@/shared/lib/api'

// TODO (F6): sign-download -> URLs firmadas (60 s) o ZIP
export function requestDownload(photoIds: string[]) {
  return callFunction<{ urls: string[] }>('sign-download', { photoIds })
}
