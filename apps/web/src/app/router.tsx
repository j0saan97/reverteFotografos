import { createBrowserRouter, Navigate } from 'react-router-dom'
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
import { SelectionReviewPage, ClientSelectionPage } from '@/features/selections'
import { ClientHomePage, GalleryAccessPage, GalleryViewPage } from '@/features/client-gallery'
import { DashboardPage, BrandingSettingsPage } from '@/features/dashboard'

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/login" replace /> },
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
      { path: '/my/:slug', element: <GalleryViewPage /> },
      { path: '/my/:slug/selection', element: <ClientSelectionPage /> },
    ],
  },
])
