import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/onboarding.css'

function OnboardingPage() {
  const navigate = useNavigate()

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

      <section className="onboarding-section">
        <h2>주로 분석하고자 하는 AI 및 기술 도메인을 선택해 주세요. (다중 선택, 최대 3개)</h2>

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
            <input type="checkbox" checked={domains.includes('컴퓨터 비전(CV)')} onChange={() => handleDomainChange('컴퓨터 비전(CV)')} />
            <span>컴퓨터 비전(CV)</span>
          </label>

          <label className="onboarding-option">
            <input type="checkbox" checked={domains.includes('추천 시스템(RecSys)')} onChange={() => handleDomainChange('추천 시스템(RecSys)')} />
            <span>추천 시스템(RecSys)</span>
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
            <span>기타: 본인이 직접 쓰기</span>
          </label>
        </div>

        {domains.includes('기타') && (
          <input className="onboarding-custom-input" type="text" placeholder="관심 분야를 입력해주세요" value={customDomain} onChange={(e) => { setCustomDomain(e.target.value); setError('') }} />
        )}

        {error && <p className="onboarding-error">{error}</p>}

        <div className="onboarding-actions">
          <button className="onboarding-skip-button" type="button" onClick={() => navigate('/library')}>건너뛰기</button>
          <button className="onboarding-complete-button" type="button" onClick={handleComplete}>완료</button>
        </div>
      </section>
    </main>
  )
}

export default OnboardingPage