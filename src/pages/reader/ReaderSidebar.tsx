import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/readerSidebar.css'
import { deleteChatRoom, getChatRooms, logout, renameChatRoom } from './readerApi'
import type { ChatRoom } from './readerApi'
import { HomeIcon, LogoutIcon, PencilIcon, SearchIcon, SettingsIcon, SidebarIcon, TrashIcon } from './ReaderIcons'

type ReaderSidebarProps = {
  isOpen: boolean
  onToggle: () => void
  activeRoomId: string | null
  roomsVersion: number
}

function ReaderSidebar({ isOpen, onToggle, activeRoomId, roomsVersion }: ReaderSidebarProps) {
  const navigate = useNavigate()
  const [chats, setChats] = useState<ChatRoom[]>([])
  const [menuChat, setMenuChat] = useState<string | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [editingChat, setEditingChat] = useState<string | null>(null)
  const [newName, setNewName] = useState('')

  // 최근 대화 목록 불러오기
  useEffect(() => {
    let ignore = false

    getChatRooms()
      .then((rooms) => {
        if (!ignore) setChats(rooms)
      })
      .catch(() => {
        if (!ignore) setChats([])
      })

    return () => {
      ignore = true
    }
  }, [roomsVersion, activeRoomId])

  const closeMenus = () => {
    setMenuChat(null)
    setIsUserMenuOpen(false)
  }

  const openChat = (chat: ChatRoom) => {
    if (chat.chatRoomId === activeRoomId || chat.papers.length === 0) return
    navigate(`/reader/${chat.papers[0].userPaperId}?room=${chat.chatRoomId}`)
  }

  const deleteChat = async (chatRoomId: string) => {
    closeMenus()

    try {
      await deleteChatRoom(chatRoomId)
      setChats(chats.filter((item) => item.chatRoomId !== chatRoomId))

      // 지금 보고 있는 대화를 지우면 라이브러리로 돌아갑니다.
      if (chatRoomId === activeRoomId) navigate('/library')
    } catch (error) {
      alert(error instanceof Error ? error.message : '대화를 삭제하지 못했습니다.')
    }
  }

  const startRename = (chat: ChatRoom) => {
    setEditingChat(chat.chatRoomId)
    setNewName(chat.title)
    closeMenus()
  }

  const cancelRename = () => {
    setEditingChat(null)
  }

  const saveRename = async () => {
    const chat = chats.find((item) => item.chatRoomId === editingChat)
    if (!chat) return

    const name = newName.trim()

    if (name === '' || name === chat.title) {
      cancelRename()
      return
    }

    if (chats.some((item) => item.title === name)) {
      alert('이미 같은 이름의 대화가 있습니다.')
      cancelRename()
      return
    }

    setEditingChat(null)

    try {
      const result = await renameChatRoom(chat.chatRoomId, name)
      setChats(chats.map((item) => (item.chatRoomId === chat.chatRoomId ? { ...item, title: result.title } : item)))
    } catch (error) {
      alert(error instanceof Error ? error.message : '이름을 변경하지 못했습니다.')
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      // 서버 로그아웃이 실패해도 이 기기에서는 로그아웃되도록 토큰을 지웁니다.
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    navigate('/login')
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
              <li key={chat.chatRoomId} className={`reader-sidebar-recent-item ${chat.chatRoomId === activeRoomId ? 'reader-sidebar-recent-item-active' : ''}`} onClick={() => openChat(chat)}>
                {editingChat === chat.chatRoomId ? (
                  <div className="reader-sidebar-rename" onClick={(event) => event.stopPropagation()}>
                    <input
                      className="reader-sidebar-rename-input"
                      value={newName}
                      maxLength={50}
                      autoFocus
                      onFocus={(event) => event.target.select()}
                      onChange={(event) => setNewName(event.target.value)}
                      onKeyDown={handleRenameKeyDown}
                      onBlur={cancelRename}
                    />
                    <button
                      className="reader-sidebar-rename-save"
                      type="button"
                      aria-label="이름 저장"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={saveRename}
                    >
                      ✓
                    </button>
                    <button
                      className="reader-sidebar-rename-cancel"
                      type="button"
                      aria-label="이름 변경 취소"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={cancelRename}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <>
                    <span>{chat.title}</span>
                    <button className="reader-sidebar-more" type="button" onClick={(event) => { event.stopPropagation(); setMenuChat(chat.chatRoomId) }}>···</button>
                  </>
                )}

                {menuChat === chat.chatRoomId && (
                  <div className="reader-menu reader-sidebar-chat-menu" onClick={(event) => event.stopPropagation()}>
                    <button className="reader-menu-item" type="button" onClick={() => startRename(chat)}>
                      <PencilIcon />
                      이름 변경
                    </button>
                    <div className="reader-menu-divider" />
                    <button className="reader-menu-item" type="button" onClick={() => deleteChat(chat.chatRoomId)}>
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
          <span className="reader-sidebar-user-name">용용이</span>
          <button className="reader-sidebar-more reader-sidebar-user-more" type="button" onClick={() => setIsUserMenuOpen(true)}>···</button>

          {isUserMenuOpen && (
            <div className="reader-menu reader-sidebar-user-menu">
              <button className="reader-menu-item" type="button" onClick={() => navigate('/settings')}>
                <SettingsIcon />
                설정
              </button>
              <div className="reader-menu-divider" />
              <button className="reader-menu-item reader-menu-item-danger" type="button" onClick={handleLogout}>
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