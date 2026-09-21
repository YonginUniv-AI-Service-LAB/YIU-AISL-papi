import { useState } from 'react'
import '../../styles/readerPdfViewer.css'
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, HighlighterIcon, PlusIcon } from './ReaderIcons'

type ReaderPdfViewerProps = {
  showEvidence: boolean
  onClose: () => void
  onAddPaper: () => void
}

type ReaderPdfToolbarProps = {
  page: string
}

const evidenceLines = [
  { width: 90 }, { width: 100 }, { width: 96 }, { width: 100 }, { width: 70 },
  { width: 100 }, { width: 94 }, { width: 100, evidence: 1 }, { width: 100, evidence: 1 }, { width: 60, evidence: 1 },
  { width: 100 }, { width: 88 }, { width: 100, evidence: 2 }, { width: 72, evidence: 2 }, { width: 100 },
  { width: 97 }, { width: 100 }, { width: 84 }, { width: 100 }, { width: 50 },
]

export function ReaderPdfToolbar({ page }: ReaderPdfToolbarProps) {
  return (
    <div className="reader-pdf-toolbar">
      <button className="reader-pdf-toolbar-button" type="button" aria-label="이전 페이지">
        <ChevronLeftIcon />
      </button>
      <button className="reader-pdf-toolbar-button" type="button" aria-label="다음 페이지">
        <ChevronRightIcon />
      </button>
      <span className="reader-pdf-page">{page}</span>
      <button className="reader-pdf-toolbar-button" type="button">−</button>
      <span className="reader-pdf-zoom">100%</span>
    </div>
  )
}

function ReaderPdfViewer({ showEvidence, onClose, onAddPaper }: ReaderPdfViewerProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <section className="reader-pdf-viewer">
      {isMenuOpen && <div className="reader-menu-backdrop" onClick={() => setIsMenuOpen(false)} />}

      <div className="reader-pdf-header">
        <h2 className="reader-pdf-title">Paper Title</h2>
        <button className="reader-pdf-more" type="button" onClick={() => setIsMenuOpen(true)}>···</button>

        {isMenuOpen && (
          <div className="reader-menu reader-pdf-menu">
            <button className="reader-menu-item reader-menu-item-large" type="button" onClick={() => { setIsMenuOpen(false); onAddPaper() }}>
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

      <ReaderPdfToolbar page={showEvidence ? '3 / 15' : '6 / 15'} />

      <div className="reader-pdf-body">
        {showEvidence ? (
          <div className="reader-pdf-paper reader-pdf-paper-evidence">
            {evidenceLines.map((line, index) => (
              <div key={index} className="reader-pdf-line-row">
                {line.evidence && evidenceLines[index - 1]?.evidence !== line.evidence && (
                  <span className="reader-pdf-evidence-badge">✦ AI 근거{line.evidence}</span>
                )}
                <div className={`reader-pdf-line ${line.evidence ? 'reader-pdf-line-highlight' : ''}`} style={{ width: `${line.width}%` }} />
              </div>
            ))}
          </div>
        ) : (
          <div className="reader-pdf-paper">PDF</div>
        )}
      </div>
    </section>
  )
}

export default ReaderPdfViewer
