import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import '../../styles/reader.css'
import '../../styles/readerMenu.css'
import ReaderSidebar from './ReaderSidebar'
import ReaderChat from './ReaderChat'
import ReaderPdfViewer from './ReaderPdfViewer'
import ReaderCompareViewer from './ReaderCompareViewer'
import ReaderPaperSelectModal from './ReaderPaperSelectModal'
import { ApiError, addPapersToChatRoom, createChatRoom, getChatRoomDetail, getChatRooms, getChunk, getPaperTitle } from './readerApi'
import type { Bbox, ChatRoomDetail } from './readerApi'

// 개발 모드에서 화면이 두 번 그려져도 같은 논문의 채팅방이 두 개 생기지 않도록 만드는 중인 요청을 기억합니다.
const creatingRooms = new Map<string, Promise<string>>()

const findOrCreateRoom = (userPaperId: string) => {
  const pending = creatingRooms.get(userPaperId)
  if (pending) return pending

  const promise = (async () => {
    const rooms = await getChatRooms(userPaperId)
    return rooms.length > 0 ? rooms[0].chatRoomId : (await createChatRoom([userPaperId])).chatRoomId
  })().finally(() => creatingRooms.delete(userPaperId))

  creatingRooms.set(userPaperId, promise)
  return promise
}

export type ReaderPaper = {
  userPaperId: string
  title: string
}

// 근거 확인을 눌렀을 때 PDF에서 보여줄 위치
export type EvidenceTarget = {
  userPaperId: string
  pageNo: number
  bbox: Bbox | null
}

function ReaderPage() {
  const navigate = useNavigate()
  // 라이브러리에서 넘어올 때 주소의 paperId는 백엔드의 userPaperId입니다.
  const { paperId: userPaperId } = useParams()
  const [searchParams] = useSearchParams()
  const roomIdFromUrl = searchParams.get('room')

  const [room, setRoom] = useState<ChatRoomDetail | null>(null)
  const [loadError, setLoadError] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isViewerOpen, setIsViewerOpen] = useState(true)
  const [isAddPaperOpen, setIsAddPaperOpen] = useState(false)
  const [comparePapers, setComparePapers] = useState<ReaderPaper[]>([])
  const [evidence, setEvidence] = useState<EvidenceTarget | null>(null)
  const [roomsVersion, setRoomsVersion] = useState(0)
  // 근거가 다른 논문에 있으면 뷰어에 보여줄 논문을 바꿉니다.
  const [viewerPaperId, setViewerPaperId] = useState<string | null>(null)

  // 이 논문의 채팅방을 찾고, 없으면 새로 만든 뒤 채팅방 정보를 불러옵니다.
  useEffect(() => {
    if (!userPaperId) return

    let ignore = false

    const loadRoom = async () => {
      try {
        setLoadError('')
        setRoom(null)
        setEvidence(null)
        setComparePapers([])
        setViewerPaperId(null)

        let roomId = roomIdFromUrl

        if (!roomId) {
          roomId = await findOrCreateRoom(userPaperId)
          setRoomsVersion((version) => version + 1)
        }

        const detail = await getChatRoomDetail(roomId)
        if (!ignore) setRoom(detail)
      } catch (error) {
        if (ignore) return

        if (error instanceof ApiError && error.status === 401) {
          navigate('/login')
          return
        }

        setLoadError(error instanceof Error ? error.message : '서버와 연결할 수 없습니다. 잠시 후 다시 시도해주세요.')
      }
    }

    loadRoom()

    return () => {
      ignore = true
    }
  }, [userPaperId, roomIdFromUrl, navigate])

  const reloadRoom = async () => {
    if (!room) return
    setRoom(await getChatRoomDetail(room.chatRoomId))
  }

  const activePaper = room?.papers.find((paper) => paper.userPaperId === (viewerPaperId ?? userPaperId)) ?? room?.papers[0]
  const isCompareMode = comparePapers.length >= 2

  const showEvidence = async (paperId: string, chunkId: number | null, pageNo: number | null) => {
    // 답변 근거에는 paperId가 들어 있어서, 채팅방 논문 목록에서 userPaperId를 찾습니다.
    const paper = room?.papers.find((item) => item.paperId === paperId) ?? activePaper
    if (!paper) return

    let target: EvidenceTarget = { userPaperId: paper.userPaperId, pageNo: pageNo ?? 1, bbox: null }

    if (chunkId !== null) {
      try {
        const chunk = await getChunk(paper.userPaperId, chunkId)
        target = { userPaperId: paper.userPaperId, pageNo: chunk.pageNo, bbox: chunk.bbox }
      } catch {
        // 위치 정보를 못 받아와도 페이지 이동은 할 수 있도록 그대로 진행합니다.
      }
    }

    setEvidence(target)
    setViewerPaperId(paper.userPaperId)
    setComparePapers([])
    setIsViewerOpen(true)
  }

  const removeComparePaper = (paperIdToRemove: string) => {
    setComparePapers(comparePapers.filter((paper) => paper.userPaperId !== paperIdToRemove))
  }

  const addPapers = async (userPaperIds: string[]) => {
    setIsAddPaperOpen(false)
    if (!room || userPaperIds.length === 0) return

    try {
      await addPapersToChatRoom(room.chatRoomId, userPaperIds)
      await reloadRoom()
    } catch (error) {
      alert(error instanceof Error ? error.message : '논문을 추가하지 못했습니다.')
    }
  }

  return (
    <div className="reader-page">
      <ReaderSidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        activeRoomId={room?.chatRoomId ?? null}
        roomsVersion={roomsVersion}
      />

      {loadError ? (
        <section className="reader-chat">
          <p className="reader-load-message">{loadError}</p>
        </section>
      ) : !room || !activePaper ? (
        <section className="reader-chat">
          <p className="reader-load-message">불러오는 중...</p>
        </section>
      ) : (
        <>
          <ReaderChat
            key={room.chatRoomId}
            roomId={room.chatRoomId}
            isViewerOpen={isViewerOpen}
            onOpenViewer={() => setIsViewerOpen(true)}
            comparePapers={isCompareMode ? comparePapers : []}
            onCompare={(papers) => { setComparePapers(papers); setEvidence(null); setIsViewerOpen(true) }}
            onCloseCompare={() => setComparePapers([])}
            onShowEvidence={showEvidence}
            onShowComparisonEvidence={(target) => setEvidence(target)}
            onRoomTitleChange={() => setRoomsVersion((version) => version + 1)}
          />

          {isViewerOpen && isCompareMode && (
            <ReaderCompareViewer papers={comparePapers} evidence={evidence} onRemovePaper={removeComparePaper} />
          )}
          {isViewerOpen && !isCompareMode && (
            <ReaderPdfViewer
              key={activePaper.userPaperId}
              roomId={room.chatRoomId}
              userPaperId={activePaper.userPaperId}
              title={getPaperTitle(activePaper)}
              initialPage={activePaper.lastViewedPage ?? 1}
              evidence={evidence?.userPaperId === activePaper.userPaperId ? evidence : null}
              onClose={() => setIsViewerOpen(false)}
              onAddPaper={() => setIsAddPaperOpen(true)}
            />
          )}
        </>
      )}

      {isAddPaperOpen && (
        <ReaderPaperSelectModal
          title="논문 추가"
          confirmLabel="추가"
          overlay="page"
          excludePaperIds={room?.papers.map((paper) => paper.userPaperId) ?? []}
          onClose={() => setIsAddPaperOpen(false)}
          onConfirm={(papers) => addPapers(papers.map((paper) => paper.userPaperId))}
        />
      )}
    </div>
  )
}

export default ReaderPage
