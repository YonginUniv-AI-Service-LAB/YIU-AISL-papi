import { useState } from 'react'
import '../../styles/readerPdfViewer.css'
import { CloseIcon, HighlighterIcon, PlusIcon } from './ReaderIcons'
import ReaderPdfPane from './ReaderPdfPane'
import type { EvidenceTarget } from './ReaderPage'

type ReaderPdfViewerProps = {
  roomId: string
  userPaperId: string
  title: string
  initialPage: number
  evidence: EvidenceTarget | null
  onClose: () => void
  onAddPaper: () => void
}

function ReaderPdfViewer({ roomId, userPaperId, title, initialPage, evidence, onClose, onAddPaper }: ReaderPdfViewerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isHighlightMode, setIsHighlightMode] = useState(false)

  return (
    <section className="reader-pdf-viewer">
      {isMenuOpen && <div className="reader-menu-backdrop" onClick={() => setIsMenuOpen(false)} />}

      <div className="reader-pdf-header">
        <h2 className="reader-pdf-title">{title}</h2>
        {isHighlightMode && (
          <button className="reader-pdf-highlight-mode" type="button" onClick={() => setIsHighlightMode(false)}>
            형광펜 끄기
          </button>
        )}
        <button className="reader-pdf-more" type="button" onClick={() => setIsMenuOpen(true)}>···</button>

        {isMenuOpen && (
          <div className="reader-menu reader-pdf-menu">
            <button className="reader-menu-item reader-menu-item-large" type="button" onClick={() => { setIsMenuOpen(false); onAddPaper() }}>
              <PlusIcon />
              논문 추가
            </button>
            <button className="reader-menu-item reader-menu-item-large" type="button" onClick={() => { setIsMenuOpen(false); setIsHighlightMode(!isHighlightMode) }}>
              <HighlighterIcon />
              {isHighlightMode ? '형광펜 끄기' : '형광펜'}
            </button>
            <button className="reader-menu-item reader-menu-item-large reader-menu-item-danger" type="button" onClick={onClose}>
              <CloseIcon />
              뷰어에서 닫기
            </button>
          </div>
        )}
      </div>

      <ReaderPdfPane
        userPaperId={userPaperId}
        roomId={roomId}
        initialPage={initialPage}
        evidence={evidence}
        isHighlightMode={isHighlightMode}
        showHighlights
      />
    </section>
  )
}

export default ReaderPdfViewer
