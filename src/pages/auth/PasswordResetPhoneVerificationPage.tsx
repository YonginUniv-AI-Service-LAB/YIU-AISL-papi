import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/passwordResetPhoneVerification.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetPhoneVerificationPage() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [error, setError] = useState('')
  const [errorField, setErrorField] = useState<'phone' | 'code' | ''>('')
  const [showSendModal, setShowSendModal] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const navigate = useNavigate()

  const isValidPhoneNumber = (value: string) => {
    return /^010-?\d{4}-?\d{4}$/.test(value)
  }

  const handleSendCode = () => {
    if (!phoneNumber.trim()) {
      setError('전화번호를 입력해주세요.')
      setErrorField('phone')
      return
    }

    if (!isValidPhoneNumber(phoneNumber.trim())) {
      setError('올바른 전화번호 형식을 입력해주세요.')
      setErrorField('phone')
      return
    }

    setError('')
    setErrorField('')
    setModalMessage('인증번호를 보냈습니다.')
    setShowSendModal(true)
  }

  const handleResendCode = () => {
    if (!phoneNumber.trim()) {
      setError('전화번호를 입력해주세요.')
      setErrorField('phone')
      return
    }

    if (!isValidPhoneNumber(phoneNumber.trim())) {
      setError('올바른 전화번호 형식을 입력해주세요.')
      setErrorField('phone')
      return
    }

    setError('')
    setErrorField('')
    setModalMessage('인증번호를 다시 보냈습니다.')
    setShowSendModal(true)
  }

  const handleVerify = () => {
    if (!phoneNumber.trim()) {
      setError('전화번호를 입력해주세요.')
      setErrorField('phone')
      return
    }

    if (!isValidPhoneNumber(phoneNumber.trim())) {
      setError('올바른 전화번호 형식을 입력해주세요.')
      setErrorField('phone')
      return
    }

    if (!verificationCode.trim()) {
      setError('인증번호를 입력해주세요.')
      setErrorField('code')
      return
    }

    setError('')
    setErrorField('')
    navigate('/password-reset/new-password')
  }

  return (
    <main className="password-reset-phone-page">
      <img className="password-reset-phone-logo" src={papiLogo} alt="PAPI" />

      <section className="password-reset-phone-container">
        <div className="password-reset-phone-header">
          <h1>비밀번호 재설정</h1>
          <p>전화번호 인증</p>
        </div>

        <div className="password-reset-phone-field">
          <label htmlFor="phoneNumber">전화번호</label>

          <div className="password-reset-phone-row">
            <input id="phoneNumber" className={errorField === 'phone' ? 'password-reset-phone-input-error' : ''} type="tel" placeholder="전화번호를 입력해주세요." value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); if (errorField === 'phone') { setError(''); setErrorField('') } }} />
            <button type="button" onClick={handleSendCode}>인증번호 받기</button>
          </div>
        </div>

        <div className="password-reset-phone-field">
          <label htmlFor="phoneVerificationCode">인증번호</label>
          <input id="phoneVerificationCode" className={`password-reset-phone-code-input ${errorField === 'code' ? 'password-reset-phone-input-error' : ''}`} type="text" placeholder="인증번호 입력" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value); if (errorField === 'code') { setError(''); setErrorField('') } }} />
        </div>

        {error && <p className="password-reset-phone-error">{error}</p>}

        <button className="password-reset-phone-button" type="button" onClick={handleVerify}>인증하기</button>
        <button className="password-reset-phone-resend" type="button" onClick={handleResendCode}>인증번호 다시 보내기</button>
        <button className="password-reset-phone-back" type="button" onClick={() => navigate('/password-reset')}>← 이전</button>
      </section>

      {showSendModal && (
        <div className="password-reset-phone-modal-overlay">
          <div className="password-reset-phone-modal">
            <p>{modalMessage}</p>
            <button type="button" onClick={() => setShowSendModal(false)}>확인</button>
          </div>
        </div>
      )}
    </main>
  )
}

export default PasswordResetPhoneVerificationPage