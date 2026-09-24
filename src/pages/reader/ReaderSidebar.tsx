import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/readerSidebar.css'
import { HomeIcon, LogoutIcon, PencilIcon, SearchIcon, SettingsIcon, SidebarIcon, TrashIcon } from './ReaderIcons'

type ReaderSidebarProps = {
  isOpen: boolean
  onToggle: () => void
}

function ReaderSidebar({ isOpen, onToggle }: ReaderSidebarProps) {
  const navigate = useNavigate()
  const [chats, setChats] = useState(['Transfomer 구조', 'RAG 논문 구조', '논문 관련 질문', 'CLIP'])
  const [activeChat, setActiveChat] = useState('RAG 논문 구조')
  const [menuChat, setMenuChat] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [editingChat, setEditingChat] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  const closeMenus = () => {
    setMenuChat(null)
    setIsUserMenuOpen(false)
  }

  const deleteChat = (chat: string) => {
    setChats(chats.filter((item) => item !== chat))
    closeMenus()
  }

  const startRename = (chat: string) => {
    setEditingChat(chat)
    setNewName(chat)
    closeMenus()
  }

  const cancelRename = () => {
    setEditingChat(null)
  }

  const saveRename = () => {
    if (editingChat === null) return

    const name = newName.trim()

    if (name === '' || name === editingChat) {
      cancelRename()
      return
    }

    if (chats.includes(name)) {
      alert('이미 같은 이름의 대화가 있습니다.')
      return
    }

    setChats(chats.map((item) => (item === editingChat ? name : item)))

    if (activeChat === editingChat) {
      setActiveChat(name)
    }

    setEditingChat(null)
  }

  const handleRenameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return

    if (event.key === 'Enter') saveRename()
    if (event.key === 'Escape') cancelRename()
  }

  return (
    <aside className={`reader-sidebar ${isOpen ? '' : 'reader-sidebar-closed'}`}>
      {(menuChat || isUserMenuOpen) && <div className="reader-menu-backdrop" onClick={closeMenus} />}

      <div className="reader-sidebar-header">
        {isOpen && <h1 className="reader-sidebar-title">논문 챗</h1>}
        <button className="reader-sidebar-toggle" type="button" aria-label={isOpen ? '사이드바 닫기' : '사이드바 열기'} onClick={onToggle}>
          <SidebarIcon />
        </button>
      </div>

      <nav className="reader-sidebar-menu">
        <button className="reader-sidebar-menu-item" type="button" onClick={() => navigate('/library')}>
          <HomeIcon />
          {isOpen && '홈'}
        </button>
        <button className="reader-sidebar-menu-item" type="button">
          <SearchIcon />
          {isOpen && '탐색'}
        </button>
      </nav>

      {isOpen && (
        <div className="reader-sidebar-recent">
          <p className="reader-sidebar-recent-title">최근</p>
          <ul className="reader-sidebar-recent-list">
            {chats.map((chat) => (
              <li key={chat} className={`reader-sidebar-recent-item ${chat === activeChat ? 'reader-sidebar-recent-item-active' : ''}`} onClick={() => setActiveChat(chat)}>
                {editingChat === chat ? (
                  <input
                    className="reader-sidebar-rename-input"
                    value={newName}
                    maxLength={50}
                    autoFocus
                    onFocus={(event) => event.target.select()}
                    onChange={(event) => setNewName(event.target.value)}
                    onKeyDown={handleRenameKeyDown}
                    onBlur={saveRename}
                    onClick={(event) => event.stopPropagation()}
                  />
                ) : (
                  <>
                    <span>{chat}</span>
                    <button className="reader-sidebar-more" type="button" onClick={(event) => { event.stopPropagation(); setMenuChat(chat) }}>···</button>
                  </>
                )}

                {menuChat === chat && (
                  <div className="reader-menu reader-sidebar-chat-menu" onClick={(event) => event.stopPropagation()}>
                    <button className="reader-menu-item" type="button" onClick={() => startRename(chat)}>
                      <PencilIcon />
                      이름 변경
                    </button>
                    <div className="reader-menu-divider" />
                    <button className="reader-menu-item" type="button" onClick={() => deleteChat(chat)}>
                      <TrashIcon />
                      삭제
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isOpen && (
        <div className="reader-sidebar-user">
          <div className="reader-sidebar-avatar" />
          <span className="reader-sidebar-user-name">유채현</span>
          <button className="reader-sidebar-more reader-sidebar-user-more" type="button" onClick={() => setIsUserMenuOpen(true)}>···</button>

          {isUserMenuOpen && (
            <div className="reader-menu reader-sidebar-user-menu">
              <button className="reader-menu-item" type="button" onClick={() => navigate('/settings')}>
                <SettingsIcon />
                설정
              </button>
              <div className="reader-menu-divider" />
              <button className="reader-menu-item reader-menu-item-danger" type="button" onClick={() => navigate('/login')}>
                <LogoutIcon />
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  )
}

export default ReaderSidebar