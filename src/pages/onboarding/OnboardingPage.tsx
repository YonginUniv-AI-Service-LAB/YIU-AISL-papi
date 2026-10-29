import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/onboarding.css'

type DomainOption = {
  label: string
  code: string
}

const domainOptions: DomainOption[] = [
  { label: 'LLM & RAG', code: 'llm_rag' },
  { label: 'NLP', code: 'nlp' },
  { label: '컴퓨터 비전(CV)', code: 'cv' },
  { label: '추천 시스템(RecSys)', code: 'recsys' },
  { label: '멀티모달', code: 'multimodal' },
  { label: 'Reinforcement Learning', code: 'rl' },
  { label: '기타', code: 'other' },
]

function OnboardingPage() {
  const navigate = useNavigate()

  const [domains, setDomains] = useState<string[]>([
    'llm_rag',
    'nlp',
  ])
  const [customDomain, setCustomDomain] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleDomainChange = (domainCode: string) => {
    if (domains.includes(domainCode)) {
      setDomains(domains.filter((item) => item !== domainCode))
      setError('')
      return
    }

    if (domains.length >= 3) {
      setError('관심 분야는 최대 3개까지 선택할 수 있습니다.')
      return
    }

    setDomains([...domains, domainCode])
    setError('')
  }

  const handleComplete = async () => {
    if (domains.length === 0) {
      setError('관심 분야를 최소 1개 선택해주세요.')
      return
    }

    if (domains.includes('other') && !customDomain.trim()) {
      setError('기타 관심 분야를 입력해주세요.')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      const requestDomains = domains.map((domainCode, index) => ({
        domainCode,
        customLabel:
          domainCode === 'other' ? customDomain.trim() : null,
        rank: index + 1,
      }))

      const response = await fetch(
        'http://localhost:8080/api/me/onboarding',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            action: 'complete',
            domains: requestDomains,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setError(
          result?.error?.message ??
            '온보딩 저장에 실패했습니다.'
        )
        return
      }

      navigate('/library')
    } catch {
      setError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = async () => {
    try {
      setIsSubmitting(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/me/onboarding',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            action: 'skip',
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setError(
          result?.error?.message ??
            '온보딩을 건너뛰지 못했습니다.'
        )
        return
      }

      navigate('/library')
    } catch {
      setError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="onboarding-page">
      <h1 className="onboarding-title">사용자 성향 설정</h1>

      <section className="onboarding-section">
        <h2>
          주로 분석하고자 하는 AI 및 기술 도메인을 선택해 주세요.
          (다중 선택, 최대 3개)
        </h2>

        <div className="onboarding-options">
          {domainOptions.map((option) => (
            <label
              key={option.code}
              className="onboarding-option"
            >
              <input
                type="checkbox"
                checked={domains.includes(option.code)}
                onChange={() => handleDomainChange(option.code)}
                disabled={isSubmitting}
              />
              <span>
                {option.label === '기타'
                  ? '기타: 본인이 직접 쓰기'
                  : option.label}
              </span>
            </label>
          ))}
        </div>

        {domains.includes('other') && (
          <input
            className="onboarding-custom-input"
            type="text"
            placeholder="관심 분야를 입력해주세요"
            value={customDomain}
            onChange={(e) => {
              setCustomDomain(e.target.value)
              setError('')
            }}
            disabled={isSubmitting}
          />
        )}

        {error && (
          <p className="onboarding-error">
            {error}
          </p>
        )}

        <div className="onboarding-actions">
          <button
            className="onboarding-skip-button"
            type="button"
            onClick={handleSkip}
            disabled={isSubmitting}
          >
            {isSubmitting ? '처리 중...' : '건너뛰기'}
          </button>

          <button
            className="onboarding-complete-button"
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
          >
            {isSubmitting ? '저장 중...' : '완료'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default OnboardingPage