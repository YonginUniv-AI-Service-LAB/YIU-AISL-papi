import { useState } from 'react'
import '../../styles/interest.css'

function InterestPage() {
  const [selectedInterest, setSelectedInterest] = useState('AI / 머신러닝')
  const [error, setError] = useState('')

  const interests = [
    'AI / 머신러닝',
    '데이터',
    '소프트웨어',
    '기타',
  ]

  const handleSave = () => {
    if (!selectedInterest) {
      setError('관심 분야를 선택해주세요.')
      return
    }

    setError('')
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

          <div className="interest-options">
            {interests.map((interest) => (
              <label
                key={interest}
                className={`interest-option ${
                  selectedInterest === interest ? 'selected' : ''
                }`}
              >
                <input type="radio" name="interest" value={interest} checked={selectedInterest === interest} onChange={() => { setSelectedInterest(interest); setError('') }} />
                <span>{interest}</span>
              </label>
            ))}
          </div>
        </div>

        {error && <p className="interest-error">{error}</p>}

        <button className="interest-save-button" type="button" onClick={handleSave}>저장</button>
      </section>
    </main>
  )
}

export default InterestPage