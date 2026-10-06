import { useEffect, useState } from 'react'
import '../../styles/aiSettings.css'

function AISettingsPage() {
  const [name, setName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [version, setVersion] = useState(0)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(
          'http://localhost:8080/api/me/settings',
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
            result?.error?.message ??
              'AI 설정을 불러오지 못했습니다.'
          )
          return
        }

        const result = await response.json()

        setName(result.data.aiNickname ?? '')
        setPrompt(result.data.basePrompt ?? '')
        setVersion(result.data.version ?? 0)
      } catch {
        setError(
          '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    if (!name.trim()) {
      setError('AI가 사용자를 부르는 이름을 입력해주세요.')
      return
    }

    if (!prompt.trim()) {
      setError('기본 프롬프트를 입력해주세요.')
      return
    }

    try {
      setIsSaving(true)
      setError('')

      const response = await fetch(
        'http://localhost:8080/api/me/settings',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            aiNickname: name.trim(),
            basePrompt: prompt.trim(),
            version,
          }),
        }
      )

      if (!response.ok) {
        const result = await response.json()

        setError(
          result?.error?.message ??
            'AI 설정 저장에 실패했습니다.'
        )
        return
      }

      const result = await response.json()

      setName(result.data.aiNickname ?? '')
      setPrompt(result.data.basePrompt ?? '')
      setVersion(result.data.version ?? version)
    } catch {
      setError(
        '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
      )
    } finally {
      setIsSaving(false)
    }
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
            <input
              id="aiName"
              type="text"
              placeholder="이름을 입력하세요."
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              disabled={isLoading || isSaving}
            />
          </div>

          <div className="ai-settings-field">
            <label htmlFor="defaultPrompt">기본 프롬프트</label>
            <textarea
              id="defaultPrompt"
              placeholder="기본 프롬프트를 입력하세요."
              value={prompt}
              onChange={(e) => {
                setPrompt(e.target.value)
                setError('')
              }}
              disabled={isLoading || isSaving}
            />
          </div>

          {error && (
            <p className="ai-settings-error">
              {error}
            </p>
          )}

          <button
            className="ai-settings-save-button"
            type="button"
            onClick={handleSave}
            disabled={isLoading || isSaving}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default AISettingsPage