import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema } from '@galeria/shared'
import { useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import {
  Alert,
  Button,
  InstagramIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  Select,
  TextArea,
  TextField,
  WhatsAppIcon,
} from '@/shared/components'
import { SESSION_TYPE_OPTIONS, SITE } from '../content'
import { contactService, whatsappUrl, type ContactValues } from '../services/contactService'
import { SectionHeading } from './SectionHeading'

export function ContactSection() {
  return (
    <section id="contacto" className="scroll-mt-20 bg-stone-50 py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-8 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <SectionHeading
            eyebrow="Contacto"
            title="Hablemos de tu sesión"
            intro="Cuéntanos qué tienes en mente y te responderemos en menos de 48 horas con disponibilidad y presupuesto."
            align="left"
          />
          <ContactChannels />
        </div>
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

function ContactChannels() {
  const wa = whatsappUrl(SITE.whatsapp, SITE.whatsappMessage)
  return (
    <div className="mt-10 space-y-6">
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1ebe5b]"
      >
        <WhatsAppIcon />
        Escríbenos por WhatsApp
      </a>
      <ul className="space-y-4 text-stone-700">
        <Channel icon={<PhoneIcon />} href={`tel:${SITE.phone.replace(/\s/g, '')}`}>
          {SITE.phone}
        </Channel>
        <Channel icon={<MailIcon />} href={`mailto:${SITE.email}`}>
          {SITE.email}
        </Channel>
        <Channel icon={<InstagramIcon />} href={`https://instagram.com/${SITE.instagram}`} external>
          @{SITE.instagram}
        </Channel>
        <Channel icon={<MapPinIcon />}>{SITE.city}</Channel>
      </ul>
    </div>
  )
}

function Channel({
  icon,
  href,
  external,
  children,
}: {
  icon: ReactNode
  href?: string
  external?: boolean
  children: ReactNode
}) {
  const content = (
    <>
      <span className="flex size-10 items-center justify-center rounded-full bg-white text-stone-700 ring-1 ring-stone-200">
        {icon}
      </span>
      <span>{children}</span>
    </>
  )
  return (
    <li>
      {href ? (
        <a
          href={href}
          {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="flex items-center gap-4 transition-colors hover:text-stone-950"
        >
          {content}
        </a>
      ) : (
        <div className="flex items-center gap-4">{content}</div>
      )}
    </li>
  )
}

function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactValues>({ resolver: zodResolver(contactSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setStatus('idle')
    try {
      await contactService.send(values)
      setStatus('sent')
      reset()
    } catch {
      setStatus('error')
    }
  })

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5 rounded-sm bg-white p-6 shadow-sm ring-1 ring-stone-200 sm:p-10"
    >
      {status === 'sent' && (
        <Alert tone="success">¡Gracias! Hemos recibido tu mensaje y te responderemos pronto.</Alert>
      )}
      {status === 'error' && (
        <Alert tone="error">
          No hemos podido enviar el mensaje. Inténtalo de nuevo o escríbenos por{' '}
          <a
            href={whatsappUrl(SITE.whatsapp, SITE.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline"
          >
            WhatsApp
          </a>
          .
        </Alert>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Nombre"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          label="Teléfono (opcional)"
          type="tel"
          autoComplete="tel"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Select
          label="Tipo de sesión"
          placeholder="Elige una opción"
          options={SESSION_TYPE_OPTIONS}
          error={errors.sessionType?.message}
          {...register('sessionType')}
        />
        <TextField
          label="Fecha aproximada (opcional)"
          type="date"
          className="sm:col-span-2"
          error={errors.eventDate?.message}
          {...register('eventDate')}
        />
      </div>
      <TextArea
        label="Mensaje"
        placeholder="Cuéntanos qué te gustaría: lugar, número de personas, ideas…"
        error={errors.message?.message}
        {...register('message')}
      />

      {/* Honeypot for bots: hidden from people and assistive tech */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
        {...register('website')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full sm:w-auto sm:px-10">
        Enviar mensaje
      </Button>
    </form>
  )
}
