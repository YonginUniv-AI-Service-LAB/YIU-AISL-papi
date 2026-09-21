import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/login.css'
import papiLogo from '../../assets/papi-logo.svg'

function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [errorField, setErrorField] = useState<'loginId' | 'password' | ''>('')
  const navigate = useNavigate()

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const isValidUserId = (value: string) => {
    return /^[A-Za-z0-9]{4,10}$/.test(value)
  }

  const isValidPassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z]).{8}$/.test(value)
  }

  const handleLogin = () => {
    const trimmedLoginId = loginId.trim()

    if (!trimmedLoginId) {
      setErrorMessage('이메일 또는 아이디를 입력해주세요.')
      setErrorField('loginId')
      return
    }

    if (trimmedLoginId.includes('@')) {
      if (!isValidEmail(trimmedLoginId)) {
        setErrorMessage('올바른 이메일 형식을 입력해주세요.')
        setErrorField('loginId')
        return
      }
    } else {
      if (!isValidUserId(trimmedLoginId)) {
        setErrorMessage('아이디는 영문과 숫자로 4자 이상 10자 이하로 입력해주세요.')
        setErrorField('loginId')
        return
      }
    }

    if (!password.trim()) {
      setErrorMessage('비밀번호를 입력해주세요.')
      setErrorField('password')
      return
    }

    if (!isValidPassword(password)) {
      setErrorMessage('비밀번호는 8자이며 영문 대문자와 소문자를 각각 1개 이상 포함해야 합니다.')
      setErrorField('password')
      return
    }

    setErrorMessage('')
    setErrorField('')
    navigate('/library')
  }

  return (
    <main className="login-page">
      <img className="login-logo" src={papiLogo} alt="PAPI" />

      <section className="login-container">
        <h1 className="login-title">로그인</h1>

        <div className="login-input-group">
          <input className={`login-input ${errorField === 'loginId' ? 'login-input-error' : ''}`} type="text" placeholder="이메일 또는 아이디 입력" value={loginId} onChange={(e) => { setLoginId(e.target.value); if (errorField === 'loginId') { setErrorMessage(''); setErrorField('') } }} />

          <input className={`login-input ${errorField === 'password' ? 'login-input-error' : ''}`} type="password" placeholder="비밀번호 입력" value={password} onChange={(e) => { setPassword(e.target.value); if (errorField === 'password') { setErrorMessage(''); setErrorField('') } }} />

          {errorMessage && (
            <div className="login-error-message">
              <span>!</span>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <button className="forgot-password" type="button" onClick={() => navigate('/password-reset')}>비밀번호를 잊으셨나요?</button>

        <div className="login-button-group">
          <button className="login-button" type="button" onClick={handleLogin}>로그인</button>
        </div>

        <div className="signup-guide">
          <span>계정이 없으신가요?</span>
          <button type="button" onClick={() => navigate('/signup')}>회원가입</button>
        </div>
      </section>
    </main>
  )
}

export default LoginPage