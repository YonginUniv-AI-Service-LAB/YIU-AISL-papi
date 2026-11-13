import { useState } from 'react'
import '../../styles/readerPdfViewer.css'
import '../../styles/readerCompareViewer.css'
import { ChevronLeftIcon, ChevronRightIcon, FileIcon } from './ReaderIcons'
import { ReaderPdfToolbar } from './ReaderPdfViewer'

type ReaderCompareViewerProps = {
  papers: string[]
  onRemovePaper: (paper: string) => void
}

const pages = ['6 / 15', '23 / 42']

function ReaderCompareViewer({ papers, onRemovePaper }: ReaderCompareViewerProps) {
  const [activeTab, setActiveTab] = useState(papers[0])

  return (
    <section className="reader-compare-viewer">
      <div className="reader-compare-tabs">
        <button className="reader-compare-tab-arrow" type="button" aria-label="이전 탭">
          <ChevronLeftIcon size={18} />
        </button>

        <div className="reader-compare-tab-list">
          {papers.map((paper) => (
            <div key={paper} className={`reader-compare-tab ${paper === activeTab ? 'reader-compare-tab-active' : ''}`} onClick={() => setActiveTab(paper)}>
              <FileIcon />
              <span className="reader-compare-tab-name">{paper}</span>
              <button className="reader-compare-tab-close" type="button" onClick={(event) => { event.stopPropagation(); onRemovePaper(paper) }}>x</button>
            </div>
          ))}
        </div>

        <button className="reader-compare-tab-arrow" type="button" aria-label="다음 탭">
          <ChevronRightIcon size={18} />
        </button>
      </div>

      {papers.slice(0, 2).map((paper, index) => (
        <div key={paper} className="reader-compare-pane">
          <div className="reader-pdf-header">
            <h2 className="reader-pdf-title">{paper}</h2>
            <button className="reader-pdf-more" type="button">···</button>
          </div>

          <ReaderPdfToolbar page={pages[index]} />

          <div className="reader-pdf-body">
            <div className="reader-compare-paper">PDF_{index + 1}</div>
          </div>
        </div>
      ))}
    </section>
  )
}

export default ReaderCompareViewer
