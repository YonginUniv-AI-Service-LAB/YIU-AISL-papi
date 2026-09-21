import { useState } from 'react'
import '../../styles/reader.css'
import '../../styles/readerMenu.css'
import ReaderSidebar from './ReaderSidebar'
import ReaderChat from './ReaderChat'
import ReaderPdfViewer from './ReaderPdfViewer'

function ReaderPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isViewerOpen, setIsViewerOpen] = useState(true)

  return (
    <div className="reader-page">
      <ReaderSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <ReaderChat isViewerOpen={isViewerOpen} onOpenViewer={() => setIsViewerOpen(true)} />
      {isViewerOpen && <ReaderPdfViewer onClose={() => setIsViewerOpen(false)} />}
    </div>
  )
}

export default ReaderPage
