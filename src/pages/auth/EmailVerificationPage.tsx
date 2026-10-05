import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/emailVerification.css'
import papiLogo from '../../assets/papi-logo.svg'

function EmailVerificationPage() {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [showResendModal, setShowResendModal] = useState(false)
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

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      setError('인증번호를 입력해주세요.')
      return
    }

    setError('')

    navigate('/signup/email-verification/complete', {
      state: {
        email,
        signupData,
      },
    })
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
          <p>인증 메일을 발송했습니다.<br />이메일로 전송된 인증번호를 입력해주세요.</p>
        </div>

        <input className="email-verification-input" type="text" placeholder="인증번호 입력" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value); setError('') }} />

        {error && <p className="email-verification-error">{error}</p>}

        <button className="email-verification-button" type="button" onClick={handleVerify}>인증하기</button>

        <p className="email-verification-resend-text">인증번호를 받지 못하셨나요?</p>

        <button className="email-verification-resend-button" type="button" onClick={() => setShowResendModal(true)}>인증번호 다시 보내기</button>

        <button className="email-verification-back" type="button" onClick={handleBack}>← 회원가입으로 돌아가기</button>
      </section>

      {showResendModal && (
        <div className="email-verification-modal-overlay">
          <div className="email-verification-modal">
            <p>인증번호를 다시 보냈습니다.</p>
            <button type="button" onClick={() => setShowResendModal(false)}>확인</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default EmailVerificationPage