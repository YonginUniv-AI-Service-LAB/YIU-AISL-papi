import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import '../../styles/signup.css'
import papiLogo from '../../assets/papi-logo.svg'

function SignupPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const verificationState = location.state as {
    emailVerified?: boolean
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

  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [nickname, setNickname] = useState(verificationState?.signupData?.nickname ?? '')
  const [userId, setUserId] = useState(verificationState?.signupData?.userId ?? '')
  const [password, setPassword] = useState(verificationState?.signupData?.password ?? '')
  const [passwordConfirm, setPasswordConfirm] = useState(verificationState?.signupData?.passwordConfirm ?? '')
  const [email, setEmail] = useState(verificationState?.signupData?.email ?? verificationState?.email ?? '')
  const [privacyAgreed, setPrivacyAgreed] = useState(verificationState?.signupData?.privacyAgreed ?? false)
  const [emailVerified, setEmailVerified] = useState(verificationState?.emailVerified ?? false)
  const [error, setError] = useState('')

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const isValidUserId = (value: string) => {
    return value.length >= 4 && value.length <= 10
  }

  const isValidPassword = (value: string) => {
    return /^(?=.*[a-z])(?=.*[A-Z]).{8}$/.test(value)
  }

  const handleEmailVerification = () => {
    if (!email.trim()) {
      setError('이메일을 입력해주세요.')
      return
    }

    if (!isValidEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    setError('')

    navigate('/signup/email-verification', {
      state: {
        email,
        signupData: {
          nickname,
          userId,
          password,
          passwordConfirm,
          email,
          privacyAgreed,
        },
      },
    })
  }

  const handleSignup = () => {
    if (!nickname.trim() || !userId.trim() || !password.trim() || !passwordConfirm.trim() || !email.trim()) {
      setError('모든 항목을 입력해주세요.')
      return
    }

    if (!isValidUserId(userId.trim())) {
      setError('아이디는 4자 이상 10자 이하로 입력해주세요.')
      return
    }

    if (!isValidPassword(password)) {
      setError('비밀번호는 8자이며 영문 대문자와 소문자를 각각 1개 이상 포함해야 합니다.')
      return
    }

    if (password !== passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!isValidEmail(email)) {
      setError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    if (!emailVerified) {
      setError('이메일 인증을 완료해주세요.')
      return
    }

    if (!privacyAgreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.')
      return
    }

    setError('')
    navigate('/signup/complete', { state: { signupCompleted: true } })
  }

  return (
    <main className="signup-page">
      <img className="signup-logo" src={papiLogo} alt="PAPI" />

      <section className="signup-container">
        <h1 className="signup-title">회원가입</h1>

        <div className="signup-input-group">
          <input className="signup-input" type="text" placeholder="닉네임" value={nickname} onChange={(e) => { setNickname(e.target.value); setError('') }} />

          <input className="signup-input" type="text" placeholder="아이디" value={userId} onChange={(e) => { setUserId(e.target.value); setError('') }} />

          <input className="signup-input" type="password" placeholder="비밀번호" value={password} onChange={(e) => { setPassword(e.target.value); setError('') }} />

          <input className="signup-input" type="password" placeholder="비밀번호 확인" value={passwordConfirm} onChange={(e) => { setPasswordConfirm(e.target.value); setError('') }} />

          <div className="signup-email-row">
            <input className="signup-email-input" type="email" placeholder="이메일" value={email} onChange={(e) => { setEmail(e.target.value); setEmailVerified(false); setError('') }} />

            <button className="signup-verify-button" type="button" onClick={handleEmailVerification}>
              {emailVerified ? '인증 완료' : '인증하기'}
            </button>
          </div>
        </div>

        <div className="privacy-agreement">
          <div className="privacy-left">
            <input type="checkbox" id="privacy" checked={privacyAgreed} onChange={(e) => { setPrivacyAgreed(e.target.checked); setError('') }} />
            <label htmlFor="privacy">개인정보 수집 및 이용 동의</label>
          </div>

          <button className="privacy-detail-button" type="button" onClick={() => setShowPrivacyModal(true)}>상세보기</button>
        </div>

        {error && <p className="signup-error-message">{error}</p>}

        <button className="signup-button" type="button" onClick={handleSignup}>회원가입</button>

        <div className="login-guide">
          <span>이미 계정이 있으신가요?</span>
          <button type="button" onClick={() => navigate('/login')}>로그인</button>
        </div>
      </section>

      {showPrivacyModal && (
        <div className="privacy-modal-overlay">
          <div className="privacy-modal">
            <div className="privacy-modal-header">
              <h2>개인정보 수집 및 이용</h2>
              <button type="button" onClick={() => setShowPrivacyModal(false)}>✕</button>
            </div>

            <div className="privacy-modal-content">
              서비스 이용을 위해 아래와 같은 개인정보를 수집·이용합니다.
              <br /><br />
              수집 항목 : 닉네임, 아이디, 이메일
              <br />
              수집 목적 : 회원가입 및 본인 확인, 서비스 이용 및 계정 관리
              <br />
              보유 기간 : 회원 탈퇴 시까지
              <br />
              동의 거부 : 개인정보 수집·이용에 동의하지 않을 경우 회원가입이 제한될 수 있습니다.
              <br /><br />
              ※ 수집 및 이용되는 개인정보의 항목과 목적은 서비스 운영 정책에 따라 변경될 수 있습니다.
            </div>

            <div className="privacy-modal-footer">
              <button type="button" onClick={() => setShowPrivacyModal(false)}>확인</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

export default SignupPage