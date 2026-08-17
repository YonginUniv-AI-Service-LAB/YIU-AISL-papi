import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/passwordResetVerification.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetVerificationPage() {
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [showResendModal, setShowResendModal] = useState(false)
  const navigate = useNavigate()

  const handleVerify = () => {
    if (!verificationCode.trim()) {
      setError('인증번호를 입력해주세요.')
      return
    }

    setError('')
    navigate('/password-reset/new-password')
  }

  return (
    <main className="password-reset-verification-page">
      <img className="password-reset-verification-logo" src={papiLogo} alt="PAPI" />

      <section className="password-reset-verification-container">
        <div className="password-reset-verification-header">
          <h1>비밀번호 재설정</h1>
          <p>이메일로 전송된 인증번호를 입력해주세요.</p>
        </div>

        <input className="password-reset-verification-input" type="text" placeholder="인증번호 입력" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value); setError('') }} />

        {error && <p className="password-reset-verification-error">{error}</p>}

        <button className="password-reset-verification-button" type="button" onClick={handleVerify}>인증하기</button>

        <p className="password-reset-verification-text">인증번호를 받지 못하셨나요?</p>

        <button className="password-reset-verification-resend" type="button" onClick={() => setShowResendModal(true)}>인증번호 다시 보내기</button>

        <button className="password-reset-verification-back" type="button" onClick={() => navigate('/password-reset')}>← 이전</button>
      </section>

      {showResendModal && (
        <div className="password-reset-verification-modal-overlay">
          <div className="password-reset-verification-modal">
            <p>인증번호를 다시 보냈습니다.</p>
            <button type="button" onClick={() => setShowResendModal(false)}>확인</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default PasswordResetVerificationPage