import { zodResolver } from '@hookform/resolvers/zod'
import { galleryCreateSchema } from '@galeria/shared'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import type { z } from 'zod'
import { Alert, Button, PageHeader, TextField } from '@/shared/components'
import { toMessage } from '@/shared/lib/errors'
import { useCreateGallery } from '../hooks/useGalleries'

type Values = z.infer<typeof galleryCreateSchema>

export function NewGalleryPage() {
  const navigate = useNavigate()
  const create = useCreateGallery()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(galleryCreateSchema) })

  const onSubmit = handleSubmit(async ({ title }) => {
    const gallery = await create.mutateAsync(title).catch(() => null)
    if (gallery) navigate(`/galleries/${gallery.id}/settings`, { replace: true })
  })

  return (
    <>
      <PageHeader
        title="Nueva galería"
        description="Se crea como borrador: tus clientes no la verán hasta que la publiques."
        back={{ to: '/galleries', label: 'Galerías' }}
      />
      <form
        onSubmit={onSubmit}
        noValidate
        className="max-w-xl space-y-5 rounded-xl border border-stone-200 bg-white p-6"
      >
        {create.error && (
          <Alert tone="error">No se pudo crear la galería: {toMessage(create.error)}</Alert>
        )}
        <TextField
          label="Título"
          placeholder="Boda Ana y Luis"
          autoFocus
          error={errors.title?.message}
          {...register('title')}
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => navigate('/galleries')}>
            Cancelar
          </Button>
          <Button type="submit" loading={create.isPending}>
            Crear galería
          </Button>
        </div>
      </form>
    </>
  )
}
