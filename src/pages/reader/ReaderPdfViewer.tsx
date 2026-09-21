import { useState } from 'react'
import '../../styles/readerPdfViewer.css'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, HighlighterIcon, PlusIcon } from './ReaderIcons'

type ReaderPdfViewerProps = {
  onClose: () => void
}

function ReaderPdfViewer({ onClose }: ReaderPdfViewerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <section className="reader-pdf-viewer">
      {isMenuOpen && <div className="reader-menu-backdrop" onClick={() => setIsMenuOpen(false)} />}

      <div className="reader-pdf-header">
        <h2 className="reader-pdf-title">Paper Title</h2>
        <button className="reader-pdf-more" type="button" onClick={() => setIsMenuOpen(true)}>···</button>

        {isMenuOpen && (
          <div className="reader-menu reader-pdf-menu">
            <button className="reader-menu-item reader-menu-item-large" type="button" onClick={() => setIsMenuOpen(false)}>
              <PlusIcon />
              논문 추가
            </button>
            <button className="reader-menu-item reader-menu-item-large" type="button" onClick={() => setIsMenuOpen(false)}>
              <HighlighterIcon />
              형광펜
            </button>
            <button className="reader-menu-item reader-menu-item-large reader-menu-item-danger" type="button" onClick={onClose}>
              <CloseIcon />
              뷰어에서 닫기
            </button>
          </div>
        )}
      </div>

      <div className="reader-pdf-toolbar">
        <button className="reader-pdf-toolbar-button" type="button" aria-label="이전 페이지">
          <ChevronLeftIcon />
        </button>
        <button className="reader-pdf-toolbar-button" type="button" aria-label="다음 페이지">
          <ChevronRightIcon />
        </button>
        <span className="reader-pdf-page">6 / 15</span>
        <button className="reader-pdf-toolbar-button" type="button">−</button>
        <span className="reader-pdf-zoom">100%</span>
      </div>

      <div className="reader-pdf-body">
        <div className="reader-pdf-paper">PDF</div>
      </div>
    </section>
  )
}

export default ReaderPdfViewer
