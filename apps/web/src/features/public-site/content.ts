import type { ContactSessionType } from '@galeria/shared'

// ---------------------------------------------------------------------------
// Editable content of the public website.
// TODO: replace placeholder contact data and the sample Unsplash photos with
// the studio's own (later phase: managed from the photographer panel).
// ---------------------------------------------------------------------------

export const SITE = {
  tagline: 'Fotografía de bodas, retratos y eventos',
  city: 'Alicante · Valencia · Murcia',
  email: 'hola@example.com',
  phone: '+34 600 000 000',
  /** International format, digits only, for https://wa.me/ */
  whatsapp: '34600000000',
  whatsappMessage: 'Hola, me gustaría información sobre una sesión de fotos.',
  instagram: 'revertefotografos',
}

/** Sample photo helper (Unsplash CDN, cropped server-side) */
export const photo = (id: string, w: number, h: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&h=${h}&q=75`

export interface HeroSlide {
  id: string
  title: string
  subtitle: string
  alt: string
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: '1519741497674-611481863552',
    title: 'Historias que merecen ser recordadas',
    subtitle: 'Fotografía de bodas natural y elegante',
    alt: 'Novios durante su boda',
  },
  {
    id: '1534528741775-53994a69daeb',
    title: 'Retratos con personalidad',
    subtitle: 'Sesiones individuales, de pareja y profesionales',
    alt: 'Retrato de una mujer con luz natural',
  },
  {
    id: '1511895426328-dc8714191300',
    title: 'Momentos en familia',
    subtitle: 'Recuerdos auténticos para toda la vida',
    alt: 'Familia sonriendo al aire libre',
  },
  {
    id: '1492684223066-81342ee5ff30',
    title: 'Eventos con alma',
    subtitle: 'Celebraciones, conciertos y empresa',
    alt: 'Público en un evento con luces',
  },
]

export const CATEGORIES: { id: Exclude<ContactSessionType, 'other'>; label: string }[] = [
  { id: 'wedding', label: 'Bodas' },
  { id: 'portrait', label: 'Retratos' },
  { id: 'event', label: 'Eventos' },
  { id: 'family', label: 'Familia' },
]

export interface PortfolioItem {
  id: string
  category: (typeof CATEGORIES)[number]['id']
  orientation: 'portrait' | 'landscape'
  alt: string
}

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: '1511285560929-80b456fea0bc',
    category: 'wedding',
    orientation: 'portrait',
    alt: 'Pareja de novios',
  },
  {
    id: '1465495976277-4387d4b0b4c6',
    category: 'wedding',
    orientation: 'landscape',
    alt: 'Ceremonia de boda',
  },
  {
    id: '1494790108377-be9c29b29330',
    category: 'portrait',
    orientation: 'portrait',
    alt: 'Retrato femenino',
  },
  {
    id: '1540575467063-178a50c2df87',
    category: 'event',
    orientation: 'landscape',
    alt: 'Conferencia',
  },
  {
    id: '1609220136736-443140cffec6',
    category: 'family',
    orientation: 'portrait',
    alt: 'Madre e hijo',
  },
  {
    id: '1519225421980-715cb0215aed',
    category: 'wedding',
    orientation: 'landscape',
    alt: 'Detalle de boda',
  },
  {
    id: '1507003211169-0a1dd7228f2d',
    category: 'portrait',
    orientation: 'portrait',
    alt: 'Retrato masculino',
  },
  {
    id: '1501281668745-f7f57925c3b4',
    category: 'event',
    orientation: 'portrait',
    alt: 'Concierto',
  },
  { id: '1583939003579-730e3918a45a', category: 'wedding', orientation: 'portrait', alt: 'Novia' },
  {
    id: '1475503572774-15a45e5d60b9',
    category: 'family',
    orientation: 'landscape',
    alt: 'Niños jugando',
  },
  {
    id: '1517841905240-472988babdf9',
    category: 'portrait',
    orientation: 'landscape',
    alt: 'Retrato en exterior',
  },
  {
    id: '1511578314322-379afb476865',
    category: 'event',
    orientation: 'landscape',
    alt: 'Evento de empresa',
  },
  {
    id: '1606800052052-a08af7148866',
    category: 'wedding',
    orientation: 'landscape',
    alt: 'Banquete de boda',
  },
  {
    id: '1438761681033-6461ffad8d80',
    category: 'portrait',
    orientation: 'portrait',
    alt: 'Retrato sonriente',
  },
  { id: '1484665754804-74b091211472', category: 'family', orientation: 'portrait', alt: 'Familia' },
  {
    id: '1532712938310-34cb3982ef74',
    category: 'wedding',
    orientation: 'portrait',
    alt: 'Anillos de boda',
  },
  {
    id: '1505236858219-8359eb29e329',
    category: 'event',
    orientation: 'portrait',
    alt: 'Celebración',
  },
  {
    id: '1500648767791-00dcc994a43e',
    category: 'portrait',
    orientation: 'landscape',
    alt: 'Retrato de estudio',
  },
]

export const ABOUT = {
  photoId: '1554080353-a576cf803bda',
  title: 'Hola, somos Reverte Fotógrafos',
  paragraphs: [
    'Llevamos años contando historias a través de la cámara. Nos gusta la luz natural, los gestos espontáneos y las fotos que, con el tiempo, valen todavía más.',
    'Trabajamos de forma cercana y discreta: te acompañamos antes, durante y después de la sesión, y te entregamos tus fotos en una galería privada donde podrás verlas, elegir tus favoritas y descargarlas.',
  ],
  stats: [
    { value: '10+', label: 'años de experiencia' },
    { value: '300+', label: 'bodas y eventos' },
    { value: '100%', label: 'galerías privadas' },
  ],
}

export const TESTIMONIALS = [
  {
    quote:
      'Se notaba que disfrutaban de su trabajo. Las fotos de nuestra boda son exactamente como lo vivimos: naturales y llenas de emoción.',
    name: 'Laura y Javier',
    context: 'Boda',
  },
  {
    quote:
      'Me sentí cómoda desde el primer minuto. La galería privada para elegir las fotos fue comodísima.',
    name: 'Marta',
    context: 'Sesión de retrato',
  },
  {
    quote:
      'Captaron a los peques tal cual son. Ya hemos repetido dos veces y volveremos el año que viene.',
    name: 'Familia Soler',
    context: 'Sesión familiar',
  },
]

export const SESSION_TYPE_OPTIONS: { value: ContactSessionType; label: string }[] = [
  { value: 'wedding', label: 'Boda' },
  { value: 'portrait', label: 'Retrato' },
  { value: 'event', label: 'Evento' },
  { value: 'family', label: 'Familia' },
  { value: 'other', label: 'Otro' },
]
