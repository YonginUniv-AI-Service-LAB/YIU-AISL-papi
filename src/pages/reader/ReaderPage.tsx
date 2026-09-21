import '../../styles/reader.css'
import ReaderSidebar from './ReaderSidebar'
import ReaderChat from './ReaderChat'
import ReaderPdfViewer from './ReaderPdfViewer'

function ReaderPage() {
  return (
    <div className="reader-page">
      <ReaderSidebar />
      <ReaderChat />
      <ReaderPdfViewer />
    </div>
  )
}

export default ReaderPage
