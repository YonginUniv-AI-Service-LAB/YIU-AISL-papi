import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/onboarding.css'

function OnboardingPage() {
  const navigate = useNavigate()

  const [position, setPosition] = useState('입문자')
  const [purpose, setPurpose] = useState('공부')
  const [domains, setDomains] = useState(['LLM & RAG', 'NLP'])
  const [customDomain, setCustomDomain] = useState('')
  const [error, setError] = useState('')

  const handleDomainChange = (domain: string) => {
    if (domains.includes(domain)) {
      setDomains(domains.filter((item) => item !== domain))
      setError('')
      return
    }

    if (domains.length >= 3) {
      setError('관심 분야는 최대 3개까지 선택할 수 있습니다.')
      return
    }

    setDomains([...domains, domain])
    setError('')
  }

  const handleComplete = () => {
    if (!position) {
      setError('현재 학습 및 직무 포지션을 선택해주세요.')
      return
    }

    if (!purpose) {
      setError('논문을 읽는 목적을 선택해주세요.')
      return
    }

    if (domains.length === 0) {
      setError('관심 분야를 최소 1개 선택해주세요.')
      return
    }

    if (domains.includes('기타') && !customDomain.trim()) {
      setError('기타 관심 분야를 입력해주세요.')
      return
    }

    setError('')
    navigate('/library')
  }

  return (
    <main className="onboarding-page">
      <h1 className="onboarding-title">사용자 성향 설정</h1>

      <div className="onboarding-content">
        <div className="onboarding-left">
          <section className="onboarding-section">
            <h2>Q1. 현재 본인의 학습 및 직무 포지션은 무엇인가요?</h2>

            <div className="onboarding-options">
              <label className="onboarding-option">
                <input type="radio" name="position" value="입문자" checked={position === '입문자'} onChange={(e) => { setPosition(e.target.value); setError('') }} />
                <span>입문자</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="position" value="학부생" checked={position === '학부생'} onChange={(e) => { setPosition(e.target.value); setError('') }} />
                <span>학부생</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="position" value="대학원 진학 준비생 / 석사 과정" checked={position === '대학원 진학 준비생 / 석사 과정'} onChange={(e) => { setPosition(e.target.value); setError('') }} />
                <span>대학원 진학 준비생 / 석사 과정</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="position" value="주니어 ML 엔지니어 / 개발자" checked={position === '주니어 ML 엔지니어 / 개발자'} onChange={(e) => { setPosition(e.target.value); setError('') }} />
                <span>주니어 ML 엔지니어 / 개발자</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="position" value="시니어 ML 엔지니어 / 연구원" checked={position === '시니어 ML 엔지니어 / 연구원'} onChange={(e) => { setPosition(e.target.value); setError('') }} />
                <span>시니어 ML 엔지니어 / 연구원</span>
              </label>
            </div>
          </section>

          <section className="onboarding-section">
            <h2>Q2. 논문을 주로 어떤 목적으로 읽나요?</h2>

            <div className="onboarding-options">
              <label className="onboarding-option">
                <input type="radio" name="purpose" value="공부" checked={purpose === '공부'} onChange={(e) => { setPurpose(e.target.value); setError('') }} />
                <span>공부</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="purpose" value="연구" checked={purpose === '연구'} onChange={(e) => { setPurpose(e.target.value); setError('') }} />
                <span>연구</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="purpose" value="프로젝트" checked={purpose === '프로젝트'} onChange={(e) => { setPurpose(e.target.value); setError('') }} />
                <span>프로젝트</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="purpose" value="최신 기술 파악" checked={purpose === '최신 기술 파악'} onChange={(e) => { setPurpose(e.target.value); setError('') }} />
                <span>최신 기술 파악</span>
              </label>

              <label className="onboarding-option">
                <input type="radio" name="purpose" value="취업 준비" checked={purpose === '취업 준비'} onChange={(e) => { setPurpose(e.target.value); setError('') }} />
                <span>취업 준비</span>
              </label>
            </div>
          </section>
        </div>

        <div className="onboarding-right">
          <section className="onboarding-section">
            <h2>Q3. 주로 분석하고자 하는 AI 및 기술 도메인을 선택해 주세요.</h2>
            <p className="onboarding-help">복수 선택 · 최대 3개</p>

            <div className="onboarding-options">
              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('LLM & RAG')} onChange={() => handleDomainChange('LLM & RAG')} />
                <span>LLM & RAG</span>
              </label>

              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('NLP')} onChange={() => handleDomainChange('NLP')} />
                <span>NLP</span>
              </label>

              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('컴퓨터 비전 (CV)')} onChange={() => handleDomainChange('컴퓨터 비전 (CV)')} />
                <span>컴퓨터 비전 (CV)</span>
              </label>

              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('추천 시스템 (RecSys)')} onChange={() => handleDomainChange('추천 시스템 (RecSys)')} />
                <span>추천 시스템 (RecSys)</span>
              </label>

              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('멀티모달')} onChange={() => handleDomainChange('멀티모달')} />
                <span>멀티모달</span>
              </label>

              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('Reinforcement Learning')} onChange={() => handleDomainChange('Reinforcement Learning')} />
                <span>Reinforcement Learning</span>
              </label>

              <label className="onboarding-option">
                <input type="checkbox" checked={domains.includes('기타')} onChange={() => handleDomainChange('기타')} />
                <span>기타</span>
              </label>
            </div>

            <input className="onboarding-custom-input" type="text" placeholder="관심 분야를 입력해주세요" value={customDomain} onChange={(e) => { setCustomDomain(e.target.value); setError('') }} />

            {error && <p className="onboarding-error">{error}</p>}

            <div className="onboarding-actions">
              <button className="onboarding-skip-button" type="button" onClick={() => navigate('/library')}>건너뛰기</button>
              <button className="onboarding-complete-button" type="button" onClick={handleComplete}>완료</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}

export default OnboardingPage