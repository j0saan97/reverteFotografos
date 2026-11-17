import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth } from './guards/RequireAuth'
import { RequireRole } from './guards/RequireRole'
import { ClientShell, PhotographerShell } from './shells'

import { LoginPage, RegisterPage, ResetPasswordPage, AcceptInvitePage } from '@/features/auth'
import {
  GalleriesListPage,
  GalleryEditorPage,
  GallerySettingsPage,
  NewGalleryPage,
} from '@/features/galleries'
import { ClientsListPage } from '@/features/clients'
import { ContactRequestsPage } from '@/features/contacts'
import {
  BookingPage,
  BookingSettingsPage,
  BookingsInboxPage,
  MyBookingsPage,
} from '@/features/bookings'
import { SelectionReviewPage, ClientSelectionPage } from '@/features/selections'
import { ClientHomePage, GalleryAccessPage, GalleryViewPage } from '@/features/client-gallery'
import { DashboardPage, BrandingSettingsPage } from '@/features/dashboard'
import { HomePage } from '@/features/public-site'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  { path: '/invite/:token', element: <AcceptInvitePage /> },
  { path: '/g/:slug', element: <GalleryAccessPage /> },

  {
    element: (
      <RequireAuth>
        <RequireRole role="photographer">
          <PhotographerShell />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/galleries', element: <GalleriesListPage /> },
      { path: '/galleries/new', element: <NewGalleryPage /> },
      { path: '/galleries/:id', element: <GalleryEditorPage /> },
      { path: '/galleries/:id/settings', element: <GallerySettingsPage /> },
      { path: '/galleries/:id/selection', element: <SelectionReviewPage /> },
      { path: '/clients', element: <ClientsListPage /> },
      { path: '/contacts', element: <ContactRequestsPage /> },
      { path: '/bookings', element: <BookingsInboxPage /> },
      { path: '/bookings/settings', element: <BookingSettingsPage /> },
      { path: '/settings/branding', element: <BrandingSettingsPage /> },
    ],
  },
  {
    element: (
      <RequireAuth>
        <RequireRole role="client">
          <ClientShell />
        </RequireRole>
      </RequireAuth>
    ),
    children: [
      { path: '/my', element: <ClientHomePage /> },
      { path: '/my/reservar', element: <BookingPage /> },
      { path: '/my/reservas', element: <MyBookingsPage /> },
      { path: '/my/:slug', element: <GalleryViewPage /> },
      { path: '/my/:slug/selection', element: <ClientSelectionPage /> },
    ],
  },
])
