import { useEffect, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import '../../styles/readerSidebar.css'
import { deleteChatRoom, getChatRooms, getMyNickname, logout, renameChatRoom } from './readerApi'
import type { ChatRoom } from './readerApi'
import { FolderIcon, LogoutIcon, PencilIcon, SettingsIcon, SidebarIcon, TrashIcon } from './ReaderIcons'

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
  const [deleteTarget, setDeleteTarget] = useState<ChatRoom | null>(null) // 삭제 확인 창에 띄울 대화
  const [nickname, setNickname] = useState('')

  // 사이드바 아래에 보여줄 내 닉네임
  useEffect(() => {
    getMyNickname()
      .then((name) => setNickname(name))
      .catch(() => setNickname(''))
  }, [])

  // 최근 대화 목록 불러오기
  useEffect(() => {
    let ignore = false

    getChatRooms()
      .then((rooms) => {
        // 논문이 모두 삭제된 빈 대화는 열 수 없어서 빼고 보여줘요
        if (!ignore) setChats(rooms.filter((room) => room.papers.length > 0))
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

  // 삭제 메뉴를 누르면 바로 지우지 않고 확인 창을 먼저 띄워요
  const askDeleteChat = (chat: ChatRoom) => {
    closeMenus()
    setDeleteTarget(chat)
  }

  const deleteChat = async (chatRoomId: string) => {
    setDeleteTarget(null)

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
    setNewName(chat.title || '새 대화')
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

      {/* 라이브러리 페이지 사이드바와 같게 "모든 문서함"만 둡니다. (탐색 기능은 현재 없음) */}
      <nav className="reader-sidebar-menu">
        <button className="reader-sidebar-menu-item" type="button" onClick={() => navigate('/library')}>
          <FolderIcon />
          {isOpen && '모든 문서함'}
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
                    <span>{chat.title || '새 대화'}</span>
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
                    <button className="reader-menu-item" type="button" onClick={() => askDeleteChat(chat)}>
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
          <span className="reader-sidebar-user-name">{nickname}</span>
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

      {deleteTarget && (
        <div className="reader-delete-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="reader-delete-modal" onClick={(event) => event.stopPropagation()}>
            <p className="reader-delete-title">대화를 삭제할까요?</p>
            <p className="reader-delete-text">'{deleteTarget.title || '새 대화'}' 대화와 메시지가 모두 삭제되며 복구할 수 없어요.</p>
            <div className="reader-delete-actions">
              <button className="reader-delete-cancel" type="button" onClick={() => setDeleteTarget(null)}>취소</button>
              <button className="reader-delete-confirm" type="button" onClick={() => deleteChat(deleteTarget.chatRoomId)}>삭제</button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default ReaderSidebar