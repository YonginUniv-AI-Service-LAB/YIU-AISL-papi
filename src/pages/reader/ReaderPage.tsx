import { useState } from 'react'
import '../../styles/reader.css'
import '../../styles/readerMenu.css'
import ReaderSidebar from './ReaderSidebar'
import ReaderChat from './ReaderChat'
import ReaderPdfViewer from './ReaderPdfViewer'
import ReaderCompareViewer from './ReaderCompareViewer'
import ReaderPaperSelectModal from './ReaderPaperSelectModal'

function ReaderPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isViewerOpen, setIsViewerOpen] = useState(true)
  const [isAddPaperOpen, setIsAddPaperOpen] = useState(false)
  const [comparePapers, setComparePapers] = useState<string[]>([])
  const [evidenceId, setEvidenceId] = useState<number | null>(null)

  const isCompareMode = comparePapers.length >= 2

  const showEvidence = (id: number) => {
    setEvidenceId(id)
    setComparePapers([])
    setIsViewerOpen(true)
  }

  const removeComparePaper = (paper: string) => {
    setComparePapers(comparePapers.filter((item) => item !== paper))
  }

  return (
    <div className="reader-page">
      <ReaderSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      <ReaderChat
        isViewerOpen={isViewerOpen}
        onOpenViewer={() => setIsViewerOpen(true)}
        comparePapers={isCompareMode ? comparePapers : []}
        onCompare={(papers) => { setComparePapers(papers); setIsViewerOpen(true) }}
        onCloseCompare={() => setComparePapers([])}
        evidenceId={evidenceId}
        onShowEvidence={showEvidence}
      />

      {isViewerOpen && isCompareMode && <ReaderCompareViewer papers={comparePapers} onRemovePaper={removeComparePaper} />}
      {isViewerOpen && !isCompareMode && (
        <ReaderPdfViewer showEvidence={evidenceId !== null} onClose={() => setIsViewerOpen(false)} onAddPaper={() => setIsAddPaperOpen(true)} />
      )}

      {isAddPaperOpen && (
        <ReaderPaperSelectModal title="논문 추가" confirmLabel="추가" overlay="page" onClose={() => setIsAddPaperOpen(false)} onConfirm={() => setIsAddPaperOpen(false)} />
      )}
    </div>
  )
}

export default ReaderPage
