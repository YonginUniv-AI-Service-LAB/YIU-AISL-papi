import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/passwordResetNewPassword.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetNewPasswordPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isChanging, setIsChanging] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  const resetState = location.state as {
    email?: string
    resetToken?: string
  } | null

  const resetToken = resetState?.resetToken ?? ''

  const isValidPassword = (value: string) => {
    return (
      value.length >= 8 &&
      value.length <= 64 &&
      /[A-Za-z]/.test(value) &&
      /\d/.test(value) &&
      /[^A-Za-z0-9]/.test(value)
    )
  }

  const handleChangePassword = async () => {
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('새 비밀번호를 모두 입력해주세요.')
      return
    }

    if (!resetToken) {
      setError('비밀번호 재설정 정보가 없습니다. 다시 시도해주세요.')
      return
    }

    if (!isValidPassword(newPassword)) {
      setError(
        '비밀번호는 8~64자이며 영문, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.'
      )
      return
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    try {
      setIsChanging(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/auth/password-reset/confirm',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            resetToken,
            newPassword,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setError(
          result?.error?.message ??
            '비밀번호 변경에 실패했습니다.'
        )
        return
      }

      navigate('/password-reset/complete', {
        state: {
          passwordResetCompleted: true,
        },
      })
    } catch {
      setError('서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsChanging(false)
    }
  }

  return (
    <main className="password-reset-new-page">
      <img
        className="password-reset-new-logo"
        src={papiLogo}
        alt="PAPI"
      />

      <section className="password-reset-new-container">
        <div className="password-reset-new-header">
          <h1>비밀번호 재설정</h1>
          <p>새로운 비밀번호를 입력해주세요.</p>
        </div>

        <input
          className="password-reset-new-input"
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value)
            setError('')
          }}
          disabled={isChanging}
        />

        <input
          className="password-reset-new-input"
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value)
            setError('')
          }}
          disabled={isChanging}
        />

        {error && (
          <p className="password-reset-new-error">
            {error}
          </p>
        )}

        <button
          className="password-reset-new-button"
          type="button"
          onClick={handleChangePassword}
          disabled={isChanging}
        >
          {isChanging ? '변경 중...' : '비밀번호 변경'}
        </button>

        <button
          className="password-reset-new-back"
          type="button"
          onClick={() =>
            navigate('/password-reset/verification', {
              state: {
                email: resetState?.email,
              },
            })
          }
          disabled={isChanging}
        >
          ← 이전
        </button>
      </section>
    </main>
  )
}

export default PasswordResetNewPasswordPage