import { createBrowserRouter } from "react-router-dom";

import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import PasswordResetPage from '../pages/auth/PasswordResetPage'
import OnboardingPage from '../pages/onboarding/OnboardingPage'
import LibraryPage from '../pages/library/LibraryPage'
import ReaderPage from '../pages/reader/ReaderPage'
import SettingsPage from '../pages/settings/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LibraryPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/signup',
    element: <SignupPage />,
  },
  {
    path: '/password-reset',
    element: <PasswordResetPage />,
  },
  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },
  {
    path: '/library',
    element: <LibraryPage />,
  },
  {
    path: '/reader/:paperId',
    element: <ReaderPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
])