import { useState } from 'react'
import '../../styles/reader.css'
import '../../styles/readerMenu.css'
import ReaderSidebar from './ReaderSidebar'
import ReaderChat from './ReaderChat'
import ReaderPdfViewer from './ReaderPdfViewer'
import ReaderPaperSelectModal from './ReaderPaperSelectModal'

function ReaderPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isViewerOpen, setIsViewerOpen] = useState(true)
  const [isAddPaperOpen, setIsAddPaperOpen] = useState(false)

  return (
    <div className="reader-page">
      <ReaderSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <ReaderChat isViewerOpen={isViewerOpen} onOpenViewer={() => setIsViewerOpen(true)} />
      {isViewerOpen && <ReaderPdfViewer onClose={() => setIsViewerOpen(false)} onAddPaper={() => setIsAddPaperOpen(true)} />}

      {isAddPaperOpen && (
        <ReaderPaperSelectModal title="논문 추가" confirmLabel="추가" overlay="page" onClose={() => setIsAddPaperOpen(false)} onConfirm={() => setIsAddPaperOpen(false)} />
      )}
    </div>
  )
}

export default ReaderPage
