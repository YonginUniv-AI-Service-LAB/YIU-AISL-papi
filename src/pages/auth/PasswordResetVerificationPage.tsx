import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/passwordResetVerification.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetVerificationPage() {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [showResendModal, setShowResendModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const verificationState = location.state as {
    email?: string
    expiresIn?: number
    resendAvailableIn?: number
  } | null

  const email = verificationState?.email ?? ''

  const handleVerify = async () => {
    const trimmedCode = verificationCode.trim()

    if (!trimmedCode) {
      setError('인증번호를 입력해주세요.')
      return
    }

    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('인증번호는 6자리 숫자로 입력해주세요.')
      return
    }

    if (!email) {
      setError('이메일 정보가 없습니다.')
      return
    }

    try {
      setIsVerifying(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/auth/password-reset/verify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            code: trimmedCode,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(
          result?.error?.message ??
            '인증번호가 올바르지 않습니다.'
        )
        return
      }

      const resetToken = result?.data?.resetToken

      if (!resetToken) {
        setError('재설정 토큰을 받지 못했습니다.')
        return
      }

      navigate('/password-reset/new-password', {
        state: {
          email,
          resetToken,
        },
      })
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (!email) {
      setError('이메일 정보가 없습니다.')
      return
    }

    try {
      setIsResending(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(
          result?.error?.message ??
            '인증번호 재전송에 실패했습니다.'
        )
        return
      }

      setShowResendModal(true)
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="password-reset-verification-page">
      <img
        className="password-reset-verification-logo"
        src={papiLogo}
        alt="PAPI"
      />

      <section className="password-reset-verification-container">
        <div className="password-reset-verification-header">
          <h1>비밀번호 재설정</h1>
          <p>
            이메일로 전송된 인증번호를 입력해주세요.
          </p>
        </div>

        <input
          className="password-reset-verification-input"
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="인증번호 입력"
          value={verificationCode}
          onChange={(e) => {
            setVerificationCode(e.target.value)
            setError('')
          }}
          disabled={isVerifying}
        />

        {error && (
          <p className="password-reset-verification-error">
            {error}
          </p>
        )}

        <button
          className="password-reset-verification-button"
          type="button"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? '인증 중...' : '인증하기'}
        </button>

        <p className="password-reset-verification-text">
          인증번호를 받지 못하셨나요?
        </p>

        <button
          className="password-reset-verification-resend"
          type="button"
          onClick={handleResend}
          disabled={isResending}
        >
          {isResending
            ? '재전송 중...'
            : '인증번호 다시 보내기'}
        </button>

        <button
          className="password-reset-verification-back"
          type="button"
          onClick={() => navigate('/password-reset', {
            state: {
              email,
            },
          })}
          disabled={isVerifying}
        >
          ← 이전
        </button>
      </section>

      {showResendModal && (
        <div className="password-reset-verification-modal-overlay">
          <div className="password-reset-verification-modal">
            <p>인증번호를 다시 보냈습니다.</p>

            <button
              type="button"
              onClick={() => setShowResendModal(false)}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default PasswordResetVerificationPage