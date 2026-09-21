import '../../styles/readerSidebar.css'

const recentChats = ['Transfomer 구조', 'RAG 논문 구조', '논문 관련 질문', 'CLIP']

function ReaderSidebar() {
  return (
    <aside className="reader-sidebar">
      <div className="reader-sidebar-header">
        <h1 className="reader-sidebar-title">논문 챗</h1>
        <button className="reader-sidebar-toggle" type="button" aria-label="사이드바 닫기">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="9" y1="3" x2="9" y2="21" />
          </svg>
        </button>
      </div>

      <nav className="reader-sidebar-menu">
        <button className="reader-sidebar-menu-item" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
          </svg>
          홈
        </button>
        <button className="reader-sidebar-menu-item" type="button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16" y2="16" />
          </svg>
          탐색
        </button>
      </nav>

      <div className="reader-sidebar-recent">
        <p className="reader-sidebar-recent-title">최근</p>
        <ul className="reader-sidebar-recent-list">
          {recentChats.map((chat) => (
            <li key={chat} className={`reader-sidebar-recent-item ${chat === 'RAG 논문 구조' ? 'reader-sidebar-recent-item-active' : ''}`}>
              <span>{chat}</span>
              <button className="reader-sidebar-more" type="button">···</button>
            </li>
          ))}
        </ul>
      </div>

      <div className="reader-sidebar-user">
        <div className="reader-sidebar-avatar" />
        <span className="reader-sidebar-user-name">유채현</span>
        <button className="reader-sidebar-more reader-sidebar-user-more" type="button">···</button>
      </div>
    </aside>
  )
}

export default ReaderSidebar
