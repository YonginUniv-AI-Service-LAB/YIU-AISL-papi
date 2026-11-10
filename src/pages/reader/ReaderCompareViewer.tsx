import { useRef, useState } from 'react'
import '../../styles/readerPdfViewer.css'
import '../../styles/readerCompareViewer.css'
import { ChevronLeftIcon, ChevronRightIcon, FileIcon } from './ReaderIcons'
import ReaderPdfPane from './ReaderPdfPane'
import type { EvidenceTarget, ReaderPaper } from './ReaderPage'

type ReaderCompareViewerProps = {
  papers: ReaderPaper[]
  evidence: EvidenceTarget | null
  onRemovePaper: (userPaperId: string) => void
}

function ReaderCompareViewer({ papers, evidence, onRemovePaper }: ReaderCompareViewerProps) {
  const [activeTab, setActiveTab] = useState(papers[0].userPaperId)
  const tabListRef = useRef<HTMLDivElement>(null)

  const scrollTabs = (direction: number) => {
    tabListRef.current?.scrollBy({ left: direction * 160, behavior: 'smooth' })
  }

  return (
    <section className="reader-compare-viewer">
      <div className="reader-compare-tabs">
        <button className="reader-compare-tab-arrow" type="button" aria-label="이전 탭" onClick={() => scrollTabs(-1)}>
          <ChevronLeftIcon size={18} />
        </button>

        <div ref={tabListRef} className="reader-compare-tab-list">
          {papers.map((paper) => (
            <div key={paper.userPaperId} className={`reader-compare-tab ${paper.userPaperId === activeTab ? 'reader-compare-tab-active' : ''}`} onClick={() => setActiveTab(paper.userPaperId)}>
              <FileIcon />
              <span className="reader-compare-tab-name">{paper.title}</span>
              <button className="reader-compare-tab-close" type="button" onClick={(event) => { event.stopPropagation(); onRemovePaper(paper.userPaperId) }}>x</button>
            </div>
          ))}
        </div>

        <button className="reader-compare-tab-arrow" type="button" aria-label="다음 탭" onClick={() => scrollTabs(1)}>
          <ChevronRightIcon size={18} />
        </button>
      </div>

      {papers.slice(0, 2).map((paper) => (
        <div key={paper.userPaperId} className="reader-compare-pane">
          <div className="reader-pdf-header">
            <h2 className="reader-pdf-title">{paper.title}</h2>
            <button className="reader-pdf-more" type="button">···</button>
          </div>

          <ReaderPdfPane
            userPaperId={paper.userPaperId}
            evidence={evidence?.userPaperId === paper.userPaperId ? evidence : null}
          />
        </div>
      ))}
    </section>
  )
}

export default ReaderCompareViewer
