import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/passwordReset.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleNext = () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('이메일을 입력해주세요.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setError('')
    navigate('/password-reset/verification', { state: { email: trimmedEmail } })
  }

  return (
    <main className="password-reset-page">
      <img className="password-reset-logo" src={papiLogo} alt="PAPI" />
      <section className="password-reset-container">
        <div className="password-reset-header">
          <h1>비밀번호 재설정</h1>
          <p>가입한 이메일을 입력해주세요.</p>
        </div>

        <input className="password-reset-input" type="email" placeholder="가입한 이메일 입력" value={email} onChange={(e) => { setEmail(e.target.value); setError('') }} />

        {error && <p className="password-reset-error">{error}</p>}

        <button className="password-reset-button" type="button" onClick={handleNext}>인증번호 받기</button>
        <button className="password-reset-back" type="button" onClick={() => navigate('/login')}>← 로그인으로 돌아가기</button>
      </section>
    </main>
  )
}

export default PasswordResetPage