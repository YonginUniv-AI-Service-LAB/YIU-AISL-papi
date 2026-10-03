import { useEffect, useState } from 'react'
import '../../styles/interest.css'

type Domain = {
  domainCode: string
  customLabel: string | null
  rank: number
}

const interests = [
  { code: 'llm_rag', label: 'LLM / RAG' },
  { code: 'nlp', label: 'NLP' },
  { code: 'cv', label: 'Computer Vision' },
  { code: 'recsys', label: '추천 시스템' },
  { code: 'multimodal', label: '멀티모달' },
  { code: 'rl', label: '강화학습' },
  { code: 'other', label: '기타' },
]

function InterestPage() {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchInterests = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/me/domains',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        )

        if (!response.ok) {
          const result = await response.json()
          setError(
            result?.error?.message ||
              '관심 분야를 불러오지 못했습니다.'
          )
          return
        }

        const result = await response.json()
        const domains: Domain[] = result?.data ?? []

        const sortedDomains = [...domains].sort(
          (a, b) => a.rank - b.rank
        )

        setSelectedInterests(
          sortedDomains.map((domain) => domain.domainCode)
        )
      } catch {
        setError(
          '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterests()
  }, [])

  const handleInterestChange = (code: string) => {
    setError('')

    setSelectedInterests((prev) => {
      if (prev.includes(code)) {
        return prev.filter((item) => item !== code)
      }

      if (prev.length >= 3) {
        setError('관심 분야는 최대 3개까지 선택할 수 있습니다.')
        return prev
      }

      return [...prev, code]
    })
  }

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      setError('관심 분야를 선택해주세요.')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/me/domains',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            domains: selectedInterests.map((domainCode, index) => ({
              domainCode,
              customLabel: null,
              rank: index + 1,
            })),
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setError(
          result?.error?.message ||
            '관심 분야 저장에 실패했습니다.'
        )
        return
      }
    } catch {
      setError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="interest-page">
      <aside className="interest-sidebar">
        <div className="interest-sidebar-title">논문 챗봇</div>

        <nav className="interest-sidebar-menu">
          <button type="button">▤ 모든 문서함</button>
          <button type="button">☆ 중요 문서함</button>
          <button type="button">☷ 읽는 중</button>
          <button type="button">✦ AI 챗봇</button>
        </nav>

        <div className="interest-sidebar-divider" />
        <span className="interest-sidebar-recent">Recent</span>
      </aside>

      <section className="interest-content">
        <header className="interest-header">
          <h1>관심 분야</h1>
          <p>관심 분야를 수정할 수 있습니다.</p>
        </header>

        <div className="interest-section">
          <h2>현재 선택된 관심 분야</h2>

          {isLoading ? (
            <p>관심 분야를 불러오는 중...</p>
          ) : (
            <div className="interest-options">
              {interests.map((interest) => (
                <label
                  key={interest.code}
                  className={`interest-option ${
                    selectedInterests.includes(interest.code)
                      ? 'selected'
                      : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    name="interest"
                    value={interest.code}
                    checked={selectedInterests.includes(interest.code)}
                    onChange={() =>
                      handleInterestChange(interest.code)
                    }
                    disabled={isSaving}
                  />

                  <span>{interest.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="interest-error">
            {error}
          </p>
        )}

        <button
          className="interest-save-button"
          type="button"
          onClick={handleSave}
          disabled={isSaving || isLoading}
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
      </section>
    </main>
  )
}

export default InterestPage