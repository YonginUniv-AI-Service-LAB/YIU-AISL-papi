import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import '../../styles/passwordResetComplete.css'
import papiLogo from '../../assets/papi-logo.svg'

function PasswordResetCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const resetState = location.state as {
    passwordResetCompleted?: boolean
  } | null

  if (!resetState?.passwordResetCompleted) {
    return <Navigate to="/password-reset" replace />
  }

  return (
    <main className="password-reset-complete-page">
      <img className="password-reset-complete-logo" src={papiLogo} alt="PAPI" />

      <section className="password-reset-complete-container">
        <div className="password-reset-complete-header">
          <h1>비밀번호 변경 완료</h1>
          <p>비밀번호가 변경되었습니다.</p>
        </div>

        <div className="password-reset-complete-icon">✓</div>

        <button className="password-reset-complete-button" type="button" onClick={() => navigate('/login')}>로그인하러 가기</button>
      </section>
    </main>
  )
}

export default PasswordResetCompletePage