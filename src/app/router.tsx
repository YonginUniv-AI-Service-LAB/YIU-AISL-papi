import { createBrowserRouter } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import SignupPage from '../pages/auth/SignupPage'
import EmailVerificationPage from '../pages/auth/EmailVerificationPage'
import EmailVerificationCompletePage from '../pages/auth/EmailVerificationCompletePage'
import SignupCompletePage from '../pages/auth/SignupCompletePage'

import PasswordResetPage from '../pages/auth/PasswordResetPage'
import PasswordResetVerificationPage from '../pages/auth/PasswordResetVerificationPage'
import PasswordResetPhoneVerificationPage from '../pages/auth/PasswordResetPhoneVerificationPage'
import PasswordResetNewPasswordPage from '../pages/auth/PasswordResetNewPasswordPage'
import PasswordResetCompletePage from '../pages/auth/PasswordResetCompletePage'

import OnboardingPage from '../pages/onboarding/OnboardingPage'

import LibraryPage from '../pages/library/LibraryPage'
import ReaderPage from '../pages/reader/ReaderPage'

import SettingsPage from '../pages/settings/SettingsPage'
import MemberInformationPage from '../pages/settings/MemberInformationPage'
import InterestPage from '../pages/settings/InterestPage'
import AISettingsPage from '../pages/settings/AISettingsPage'

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
    path: '/signup/email-verification',
    element: <EmailVerificationPage />,
  },

  {
    path: '/signup/email-verification/complete',
    element: <EmailVerificationCompletePage />,
  },

  {
    path: '/signup/complete',
    element: <SignupCompletePage />,
  },

  {
    path: '/onboarding',
    element: <OnboardingPage />,
  },

  {
    path: '/password-reset',
    element: <PasswordResetPage />,
  },

  {
    path: '/password-reset/verification',
    element: <PasswordResetVerificationPage />,
  },

  {
    path: '/password-reset/phone-verification',
    element: <PasswordResetPhoneVerificationPage />,
  },

  {
    path: '/password-reset/new-password',
    element: <PasswordResetNewPasswordPage />,
  },

  {
    path: '/password-reset/complete',
    element: <PasswordResetCompletePage />,
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

  {
    path: '/settings/member-information',
    element: <MemberInformationPage />,
  },

  {
    path: '/settings/interest',
    element: <InterestPage />,
  },

  {
    path: '/settings/ai',
    element: <AISettingsPage />,
  },
])