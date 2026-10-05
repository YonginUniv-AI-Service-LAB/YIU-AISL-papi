import { useNavigate } from 'react-router-dom'
import '../../styles/settings.css'

function SettingsPage() {
  const navigate = useNavigate()

  return (
    <main className="settings-page">
      <aside className="settings-sidebar">
        <div className="settings-sidebar-title">논문 챗봇</div>

        <nav className="settings-sidebar-menu">
          <button type="button">▤ 모든 문서함</button>
          <button type="button">☆ 중요 문서함</button>
          <button type="button">☷ 읽는 중</button>
          <button type="button">✦ AI 챗봇</button>
        </nav>

        <div className="settings-sidebar-divider" />

        <span className="settings-sidebar-recent">Recent</span>
      </aside>

      <section className="settings-content">
        <header className="settings-header">
          <h1>설정</h1>
          <p>계정 및 서비스 설정을 관리합니다.</p>
        </header>

        <div className="settings-menu-list">
          <button className="settings-menu-item" type="button" onClick={() => navigate('/settings/member-information')}>
            <div>
              <h2>회원정보</h2>
              <p>닉네임, 이메일, 비밀번호 관리</p>
            </div>
            <span>›</span>
          </button>

          <button className="settings-menu-item" type="button" onClick={() => navigate('/settings/interest')}>
            <div>
              <h2>관심 분야</h2>
              <p>AI 개인화를 위한 관심 분야 설정</p>
            </div>
            <span>›</span>
          </button>

          <button className="settings-menu-item" type="button" onClick={() => navigate('/settings/ai')}>
            <div>
              <h2>AI 설정</h2>
              <p>AI 개인화 설정</p>
            </div>
            <span>›</span>
          </button>
        </div>
      </section>
    </main>
  )
}

export default SettingsPage