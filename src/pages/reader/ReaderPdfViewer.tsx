import '../../styles/readerPdfViewer.css'

function ReaderPdfViewer() {
  return (
    <section className="reader-pdf-viewer">
      <div className="reader-pdf-header">
        <h2 className="reader-pdf-title">Paper Title</h2>
        <button className="reader-pdf-more" type="button">···</button>
      </div>

      <div className="reader-pdf-toolbar">
        <button className="reader-pdf-toolbar-button" type="button" aria-label="이전 페이지">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button className="reader-pdf-toolbar-button" type="button" aria-label="다음 페이지">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
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
