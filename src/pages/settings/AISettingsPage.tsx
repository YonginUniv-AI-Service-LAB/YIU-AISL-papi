import { useState } from 'react'
import '../../styles/aiSettings.css'

function AISettingsPage() {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!name.trim()) {
      setError('AI가 사용자를 부르는 이름을 입력해주세요.')
      return
    }

    if (!prompt.trim()) {
      setError('기본 프롬프트를 입력해주세요.')
      return
    }

    setError('')
  }

  return (
    <main className="ai-settings-page">
      <aside className="ai-settings-sidebar">
        <div className="ai-settings-sidebar-title">논문 챗봇</div>

        <nav className="ai-settings-sidebar-menu">
          <button type="button">▤ 모든 문서함</button>
          <button type="button">☆ 중요 문서함</button>
          <button type="button">☷ 읽는 중</button>
          <button type="button">✦ AI 챗봇</button>
        </nav>

        <div className="ai-settings-sidebar-divider" />
        <span className="ai-settings-sidebar-recent">Recent</span>
      </aside>

      <section className="ai-settings-content">
        <header className="ai-settings-header">
          <h1>AI 설정</h1>
          <p>AI 개인화 설정을 관리합니다.</p>
        </header>

        <div className="ai-settings-form">
          <div className="ai-settings-field">
            <label htmlFor="aiName">AI가 사용자를 부르는 이름</label>
            <input id="aiName" type="text" placeholder="이름을 입력하세요." value={name} onChange={(e) => { setName(e.target.value); setError('') }} />
          </div>

          <div className="ai-settings-field">
            <label htmlFor="defaultPrompt">기본 프롬프트</label>
            <textarea id="defaultPrompt" placeholder="기본 프롬프트를 입력하세요." value={prompt} onChange={(e) => { setPrompt(e.target.value); setError('') }} />
          </div>

          {error && <p className="ai-settings-error">{error}</p>}

          <button className="ai-settings-save-button" type="button" onClick={handleSave}>저장</button>
        </div>
      </section>
    </main>
  )
}

export default AISettingsPage