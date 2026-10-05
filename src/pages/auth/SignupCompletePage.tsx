import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import '../../styles/signupComplete.css'
import papiLogo from '../../assets/papi-logo.svg'

function SignupCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const signupState = location.state as {
    signupCompleted?: boolean
  } | null

  if (!signupState?.signupCompleted) {
    return <Navigate to="/signup" replace />
  }

  return (
    <main className="signup-complete-page">
      <img className="signup-complete-logo" src={papiLogo} alt="PAPI" />

      <section className="signup-complete-container">
        <div className="signup-complete-header">
          <h1>회원가입 완료</h1>
          <p>회원가입이 완료되었습니다.</p>
        </div>

        <div className="signup-complete-icon">✓</div>

        <button className="signup-complete-button" type="button" onClick={() => navigate('/onboarding')}>다음</button>
      </section>
    </main>
  )
}

export default SignupCompletePage