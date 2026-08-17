import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/emailVerificationComplete.css'
import papiLogo from '../../assets/papi-logo.svg'

function EmailVerificationCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()

  const verificationState = location.state as {
    email?: string
    signupData?: {
      nickname: string
      userId: string
      password: string
      passwordConfirm: string
      email: string
      privacyAgreed: boolean
    }
  } | null

  const email = verificationState?.email ?? ''
  const signupData = verificationState?.signupData

  const handleNext = () => {
    navigate('/signup', {
      state: {
        emailVerified: true,
        email,
        signupData,
      },
    })
  }

  return (
    <main className="email-verification-complete-page">
      <img className="email-verification-complete-logo" src={papiLogo} alt="PAPI" />

      <section className="email-verification-complete-container">
        <div className="email-verification-complete-header">
          <h1>이메일 인증 완료</h1>

          <p>
            이메일 인증이 완료되었습니다.
            <br />
            회원가입을 계속 진행해주세요.
          </p>
        </div>

        <div className="email-verification-success-icon">
          ✓
        </div>

        <button className="email-verification-complete-button" type="button" onClick={handleNext}>다음</button>
      </section>
    </main>
  )
}

export default EmailVerificationCompletePage