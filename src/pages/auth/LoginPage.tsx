import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/login.css'
import papiLogo from '../../assets/papi-logo.svg'

function LoginPage() {
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const navigate = useNavigate()
  const location = useLocation()

  const loginState = location.state as {
    fromSignup?: boolean
  } | null

  const handleLogin = async () => {
    setErrorMessage('')

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: loginId,
          password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        const errorCode = result?.error?.code

        if (errorCode === 'INVALID_CREDENTIALS') {
          setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.')
        } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
          setErrorMessage('이메일 인증이 필요합니다.')
        } else if (errorCode === 'ACCOUNT_SUSPENDED') {
          setErrorMessage('정지된 계정입니다.')
        } else if (errorCode === 'LOGIN_ATTEMPT_EXCEEDED') {
          setErrorMessage(
            '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.'
          )
        } else {
          setErrorMessage(
            result?.error?.message || '로그인에 실패했습니다.'
          )
        }

        return
      }

      const { accessToken, refreshToken } = result.data

      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)

      if (loginState?.fromSignup) {
        navigate('/onboarding', { replace: true })
      } else {
        navigate('/library')
      }
    } catch (error) {
      console.error('로그인 요청 실패:', error)
      setErrorMessage(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    }
  }

  return (
    <main className="login-page">
      <img className="login-logo" src={papiLogo} alt="PAPI" />

      <section className="login-container">
        <h1 className="login-title">로그인</h1>

        <div className="login-input-group">
          <input
            className={`login-input ${
              errorMessage ? 'login-input-error' : ''
            }`}
            type="text"
            placeholder="아이디 입력"
            value={loginId}
            onChange={(e) => {
              setLoginId(e.target.value)
              setErrorMessage('')
            }}
          />

          <input
            className={`login-input ${
              errorMessage ? 'login-input-error' : ''
            }`}
            type="password"
            placeholder="비밀번호 입력"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrorMessage('')
            }}
          />

          {errorMessage && (
            <div className="login-error-message">
              <span>!</span>
              <p>{errorMessage}</p>
            </div>
          )}
        </div>

        <button
          className="forgot-password"
          type="button"
          onClick={() => navigate('/password-reset')}
        >
          비밀번호를 잊으셨나요?
        </button>

        <div className="login-button-group">
          <button
            className="login-button"
            type="button"
            onClick={handleLogin}
          >
            로그인
          </button>
        </div>

        <div className="signup-guide">
          <span>계정이 없으신가요?</span>
          <button type="button" onClick={() => navigate('/signup')}>
            회원가입
          </button>
        </div>
      </section>
    </main>
  )
}

export default LoginPage