import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/emailVerification.css'
import papiLogo from '../../assets/papi-logo.svg'

function EmailVerificationPage() {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [showResendModal, setShowResendModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const verificationState = location.state as {
    email?: string
    signupData?: {
      nickname: string
      userId: string
      password: string
      passwordConfirm: string
      email: string
      privacyAgreed: boolean
    }
  } | null

  const email = verificationState?.email ?? ''
  const signupData = verificationState?.signupData

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('인증번호를 입력해주세요.')
      return
    }

    if (!email) {
      setError('이메일 정보가 없습니다.')
      return
    }

    try {
      setIsVerifying(true)
      setError('')

      const response = await fetch('http://localhost:8080/api/auth/email-verifications/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose: 'signup',
          code: verificationCode.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error?.message ?? '인증번호가 올바르지 않습니다.')
        return
      }

      navigate('/signup/email-verification/complete', {
        state: {
          email,
          signupData,
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

      const response = await fetch('http://localhost:8080/api/auth/email-verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          purpose: 'signup',
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result?.error?.message ?? '인증번호 재전송에 실패했습니다.')
        return
      }

      setShowResendModal(true)
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsResending(false)
    }
  }

  const handleBack = () => {
    navigate('/signup', {
      state: {
        email,
        signupData,
      },
    })
  }

  return (
    <main className="email-verification-page">
      <img className="email-verification-logo" src={papiLogo} alt="PAPI" />

      <section className="email-verification-container">
        <div className="email-verification-header">
          <h1>이메일 인증</h1>
          <p>
            인증 메일을 발송했습니다.
            <br />
            이메일로 전송된 인증번호를 입력해주세요.
          </p>
        </div>

        <input
          className="email-verification-input"
          type="text"
          placeholder="인증번호 입력"
          value={verificationCode}
          onChange={(e) => {
            setVerificationCode(e.target.value)
            setError('')
          }}
        />

        {error && <p className="email-verification-error">{error}</p>}

        <button className="email-verification-button" type="button" onClick={handleVerify} disabled={isVerifying}>
          {isVerifying ? '인증 중...' : '인증하기'}
        </button>

        <p className="email-verification-resend-text">인증번호를 받지 못하셨나요?</p>

        <button className="email-verification-resend-button" type="button" onClick={handleResend} disabled={isResending}>
          {isResending ? '재전송 중...' : '인증번호 다시 보내기'}
        </button>

        <button className="email-verification-back" type="button" onClick={handleBack}>
          ← 회원가입으로 돌아가기
        </button>
      </section>

      {showResendModal && (
        <div className="email-verification-modal-overlay">
          <div className="email-verification-modal">
            <p>인증번호를 다시 보냈습니다.</p>
            <button type="button" onClick={() => setShowResendModal(false)}>
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

export default EmailVerificationPage