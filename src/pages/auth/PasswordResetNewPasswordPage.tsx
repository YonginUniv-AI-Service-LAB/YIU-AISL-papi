import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/passwordResetNewPassword.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetNewPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const isValidPassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z]).{8}$/.test(value)
  }

  const handleChangePassword = () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('새 비밀번호를 모두 입력해주세요.')
      return
    }

    if (!isValidPassword(newPassword)) {
      setError('비밀번호는 8자이며 영문 대문자와 소문자를 각각 1개 이상 포함해야 합니다.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setError('')
    navigate('/password-reset/complete', { state: { passwordResetCompleted: true } })
  }

  return (
    <main className="password-reset-new-page">
      <img className="password-reset-new-logo" src={papiLogo} alt="PAPI" />

      <section className="password-reset-new-container">
        <div className="password-reset-new-header">
          <h1>비밀번호 재설정</h1>
          <p>새로운 비밀번호를 입력해주세요.</p>
        </div>

        <input className="password-reset-new-input" type="password" placeholder="새 비밀번호" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError('') }} />

        <input className="password-reset-new-input" type="password" placeholder="새 비밀번호 확인" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError('') }} />

        {error && <p className="password-reset-new-error">{error}</p>}

        <button className="password-reset-new-button" type="button" onClick={handleChangePassword}>비밀번호 변경</button>

        <button className="password-reset-new-back" type="button" onClick={() => navigate('/password-reset/phone-verification')}>← 이전</button>
      </section>
    </main>
  )
}

export default PasswordResetNewPasswordPage