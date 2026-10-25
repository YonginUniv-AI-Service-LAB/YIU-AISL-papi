import { useEffect, useRef, useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import '../../styles/readerPdfViewer.css'
import { ChevronLeftIcon, ChevronRightIcon } from './ReaderIcons'
import { createHighlight, deleteHighlight, getHighlights, getPdfInfo, saveLastPage } from './readerApi'
import type { Bbox, Highlight } from './readerApi'
import type { EvidenceTarget } from './ReaderPage'

// PDF를 화면에 그리는 pdf.js 작업 파일 위치
pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()

const MIN_ZOOM = 50
const MAX_ZOOM = 200
const ZOOM_STEP = 10

type ReaderPdfPaneProps = {
  userPaperId: string
  roomId?: string
  initialPage?: number
  evidence: EvidenceTarget | null
  isHighlightMode?: boolean
  showHighlights?: boolean
}

function ReaderPdfPane({ userPaperId, roomId, initialPage = 1, evidence, isHighlightMode = false, showHighlights = false }: ReaderPdfPaneProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [message, setMessage] = useState('PDF를 불러오는 중...')
  const [pageCount, setPageCount] = useState(0)
  const [page, setPage] = useState(evidence?.pageNo ?? initialPage)
  const [zoom, setZoom] = useState(100)
  const [bodyWidth, setBodyWidth] = useState(600)
  const [originalPageWidth, setOriginalPageWidth] = useState(0)
  const [highlights, setHighlights] = useState<Highlight[]>([])

  const bodyRef = useRef<HTMLDivElement>(null)
  const pageRef = useRef<HTMLDivElement>(null)

  // PDF 주소 불러오기 (백엔드가 잠깐 쓸 수 있는 주소를 만들어서 줍니다)
  useEffect(() => {
    let ignore = false

    getPdfInfo(userPaperId)
      .then((info) => {
        if (ignore) return
        setPdfUrl(info.pdfUrl)
        setPageCount(info.pageCount)
      })
      .catch((error) => {
        if (!ignore) setMessage(error instanceof Error ? error.message : 'PDF를 불러오지 못했습니다.')
      })

    return () => {
      ignore = true
    }
  }, [userPaperId])

  // 형광펜 목록 불러오기
  useEffect(() => {
    if (!showHighlights) return

    let ignore = false

    getHighlights(userPaperId)
      .then((result) => {
        if (!ignore) setHighlights(result)
      })
      .catch(() => {
        if (!ignore) setHighlights([])
      })

    return () => {
      ignore = true
    }
  }, [userPaperId, showHighlights])

  // 근거 확인을 누르면 해당 페이지로 이동
  const [shownEvidence, setShownEvidence] = useState(evidence)
  if (evidence !== shownEvidence) {
    setShownEvidence(evidence)
    if (evidence) setPage(evidence.pageNo)
  }

  // 마지막으로 본 페이지 저장 (페이지를 연속으로 넘겨도 3초 뒤에 한 번만 저장)
  useEffect(() => {
    if (!roomId) return

    const timer = setTimeout(() => {
      saveLastPage(roomId, userPaperId, page).catch(() => {})
    }, 3000)

    return () => clearTimeout(timer)
  }, [roomId, userPaperId, page])

  // 뷰어 너비에 맞춰 PDF 크기 계산
  useEffect(() => {
    const body = bodyRef.current
    if (!body) return

    const observer = new ResizeObserver(() => setBodyWidth(Math.min(body.clientWidth - 48, 900)))
    observer.observe(body)

    return () => observer.disconnect()
  }, [])

  const pageWidth = Math.max(bodyWidth, 200) * (zoom / 100)
  const pageScale = originalPageWidth > 0 ? pageWidth / originalPageWidth : 1

  // PDF 좌표(pt)를 화면 좌표(px)로 바꿔서 위치를 잡습니다.
  const toStyle = (bbox: Bbox) => ({
    left: bbox.x0 * pageScale,
    top: bbox.y0 * pageScale,
    width: (bbox.x1 - bbox.x0) * pageScale,
    height: (bbox.y1 - bbox.y0) * pageScale,
  })

  const saveSelection = async () => {
    if (!isHighlightMode || !roomId || !pageRef.current) return

    const selection = window.getSelection()
    const text = selection?.toString().trim()
    if (!selection || !text || selection.rangeCount === 0) return

    const rect = selection.getRangeAt(0).getBoundingClientRect()
    const pageRect = pageRef.current.getBoundingClientRect()

    const bbox = {
      x0: (rect.left - pageRect.left) / pageScale,
      y0: (rect.top - pageRect.top) / pageScale,
      x1: (rect.right - pageRect.left) / pageScale,
      y1: (rect.bottom - pageRect.top) / pageScale,
    }

    selection.removeAllRanges()

    try {
      const { highlightId } = await createHighlight(userPaperId, { chatRoomId: roomId, pageNo: page, bbox, text: text.slice(0, 2000) })
      setHighlights([...highlights, { highlightId, chatRoomId: roomId, pageNo: page, bbox, text, color: null }])
    } catch (error) {
      alert(error instanceof Error ? error.message : '형광펜을 저장하지 못했습니다.')
    }
  }

  const removeHighlight = async (highlight: Highlight) => {
    if (!confirm('이 형광펜을 지울까요?')) return

    try {
      await deleteHighlight(userPaperId, highlight.highlightId)
      setHighlights(highlights.filter((item) => item.highlightId !== highlight.highlightId))
    } catch (error) {
      alert(error instanceof Error ? error.message : '형광펜을 지우지 못했습니다.')
    }
  }

  const pageHighlights = highlights.filter((item) => item.pageNo === page && item.bbox)
  const evidenceBox = evidence?.pageNo === page ? evidence.bbox : null

  return (
    <>
      <div className="reader-pdf-toolbar">
        <button className="reader-pdf-toolbar-button" type="button" aria-label="이전 페이지" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          <ChevronLeftIcon />
        </button>
        <button className="reader-pdf-toolbar-button" type="button" aria-label="다음 페이지" disabled={page >= pageCount} onClick={() => setPage(page + 1)}>
          <ChevronRightIcon />
        </button>
        <span className="reader-pdf-page">{pageCount > 0 ? `${page} / ${pageCount}` : '- / -'}</span>
        <button className="reader-pdf-toolbar-button" type="button" aria-label="축소" disabled={zoom <= MIN_ZOOM} onClick={() => setZoom(zoom - ZOOM_STEP)}>−</button>
        <span className="reader-pdf-zoom">{zoom}%</span>
        <button className="reader-pdf-toolbar-button" type="button" aria-label="확대" disabled={zoom >= MAX_ZOOM} onClick={() => setZoom(zoom + ZOOM_STEP)}>+</button>
      </div>

      <div ref={bodyRef} className={`reader-pdf-body ${isHighlightMode ? 'reader-pdf-body-highlight-mode' : ''}`}>
        {!pdfUrl ? (
          <div className="reader-pdf-paper">{message}</div>
        ) : (
          <Document
            file={pdfUrl}
            loading={<div className="reader-pdf-paper">PDF를 불러오는 중...</div>}
            error={<div className="reader-pdf-paper">PDF를 표시할 수 없습니다.</div>}
            onLoadSuccess={(pdf) => setPageCount(pdf.numPages)}
          >
            <div ref={pageRef} className="reader-pdf-page-wrapper" onMouseUp={saveSelection}>
              <Page
                pageNumber={page}
                width={pageWidth}
                renderAnnotationLayer={false}
                onLoadSuccess={(pdfPage) => setOriginalPageWidth(pdfPage.originalWidth)}
              />

              {pageHighlights.map((highlight) => (
                <button
                  key={highlight.highlightId}
                  className="reader-pdf-highlight"
                  type="button"
                  title={`${highlight.text}\n(클릭하면 지울 수 있어요)`}
                  style={toStyle(highlight.bbox as Bbox)}
                  onClick={() => removeHighlight(highlight)}
                />
              ))}

              {evidenceBox && (
                <div className="reader-pdf-evidence-box" style={toStyle(evidenceBox)}>
                  <span className="reader-pdf-evidence-badge">✦ AI 근거</span>
                </div>
              )}
            </div>
          </Document>
        )}
      </div>
    </>
  )
}

export default ReaderPdfPane
