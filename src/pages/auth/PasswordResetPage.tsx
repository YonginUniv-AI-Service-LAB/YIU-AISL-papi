import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/passwordReset.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const handleNext = async () => {
    const trimmedEmail = email.trim()

    if (!trimmedEmail) {
      setError('이메일을 입력해주세요.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    try {
      setIsLoading(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/auth/password-reset/request',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: trimmedEmail,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        setError(
          result?.error?.message ??
            '비밀번호 재설정 요청에 실패했습니다.'
        )
        return
      }

      navigate('/password-reset/verification', {
        state: {
          email: trimmedEmail,
          expiresIn: result.data.expiresIn,
          resendAvailableIn: result.data.resendAvailableIn,
        },
      })
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="password-reset-page">
      <img
        className="password-reset-logo"
        src={papiLogo}
        alt="PAPI"
      />

      <section className="password-reset-container">
        <div className="password-reset-header">
          <h1>비밀번호 재설정</h1>
          <p>가입한 이메일을 입력해주세요.</p>
        </div>

        <input
          className="password-reset-input"
          type="email"
          placeholder="가입한 이메일 입력"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          disabled={isLoading}
        />

        {error && (
          <p className="password-reset-error">
            {error}
          </p>
        )}

        <button
          className="password-reset-button"
          type="button"
          onClick={handleNext}
          disabled={isLoading}
        >
          {isLoading ? '인증번호 보내는 중...' : '인증번호 받기'}
        </button>

        <button
          className="password-reset-back"
          type="button"
          onClick={() => navigate('/login')}
          disabled={isLoading}
        >
          ← 로그인으로 돌아가기
        </button>
      </section>
    </main>
  )
}

export default PasswordResetPage