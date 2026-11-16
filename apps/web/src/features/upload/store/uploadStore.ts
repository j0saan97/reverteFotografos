import { create } from 'zustand'

type UploadItem = {
  id: string
  file: File
  progress: number
  status: 'queued' | 'uploading' | 'done' | 'error'
}

type UploadState = {
  items: UploadItem[]
  add: (files: File[]) => void
  // TODO (F3): concurrencia (p.ej. 3), reintentos, cancelar
}

export const useUploadStore = create<UploadState>((set) => ({
  items: [],
  add: (files) =>
    set((s) => ({
      items: [
        ...s.items,
        ...files.map((file) => ({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: 'queued' as const,
        })),
      ],
    })),
}))
