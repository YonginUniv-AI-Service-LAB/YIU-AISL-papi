import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/passwordReset.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetPage() {
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'phone' | ''>('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const handleNext = () => {
    if (!verificationMethod) {
      setError('인증 방법을 선택해주세요.')
      return
    }

    if (verificationMethod === 'email') {
      if (!email.trim()) {
        setError('이메일을 입력해주세요.')
        return
      }

      if (!isValidEmail(email)) {
        setError('올바른 이메일 형식을 입력해주세요.')
        return
      }

      setError('')
      navigate('/password-reset/verification', { state: { email } })
      return
    }

    setError('')
    navigate('/password-reset/phone-verification')
  }

  return (
    <main className="password-reset-page">
      <img className="password-reset-logo" src={papiLogo} alt="PAPI" />

      <section className="password-reset-container">
        <div className="password-reset-header">
          <h1>비밀번호 재설정</h1>
          <p>본인 인증 방법을 선택해주세요.</p>
        </div>

        <div className="password-reset-methods">
          <label className={`password-reset-method ${verificationMethod === 'email' ? 'password-reset-method-selected' : ''}`}>
            <input type="radio" name="verificationMethod" value="email" checked={verificationMethod === 'email'} onChange={() => { setVerificationMethod('email'); setError('') }} />
            <span>이메일 인증</span>
          </label>

          <label className={`password-reset-method ${verificationMethod === 'phone' ? 'password-reset-method-selected' : ''}`}>
            <input type="radio" name="verificationMethod" value="phone" checked={verificationMethod === 'phone'} onChange={() => { setVerificationMethod('phone'); setError('') }} />
            <span>전화번호 인증</span>
          </label>
        </div>

        {verificationMethod === 'email' && (
          <input className="password-reset-input" type="email" placeholder="가입한 이메일 입력" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} />
        )}

        {error && <p className="password-reset-error">{error}</p>}

        <button className="password-reset-button" type="button" onClick={handleNext}>
          {verificationMethod === 'email' ? '인증번호 받기' : verificationMethod === 'phone' ? '전화번호 인증하기' : '다음'}
        </button>

        <button className="password-reset-back" type="button" onClick={() => navigate('/login')}>← 로그인으로 돌아가기</button>
      </section>
    </main>
  )
}

export default PasswordResetPage