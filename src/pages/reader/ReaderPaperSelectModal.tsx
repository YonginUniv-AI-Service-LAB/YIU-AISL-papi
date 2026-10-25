import { useEffect, useState } from 'react'
import '../../styles/readerPaperSelectModal.css'
import { SearchIcon } from './ReaderIcons'
import { getLibraryPapers, getPaperTitle } from './readerApi'
import type { ReaderPaper } from './ReaderPage'

type ReaderPaperSelectModalProps = {
  title: string
  confirmLabel: string
  showCancel?: boolean
  minSelect?: number
  maxSelect?: number
  overlay: 'page' | 'panel'
  excludePaperIds?: string[]
  onClose: () => void
  onConfirm: (selectedPapers: ReaderPaper[]) => void
}

function ReaderPaperSelectModal({ title, confirmLabel, showCancel = false, minSelect = 0, maxSelect, overlay, excludePaperIds = [], onClose, onConfirm }: ReaderPaperSelectModalProps) {
  const [papers, setPapers] = useState<ReaderPaper[]>([])
  const [message, setMessage] = useState('불러오는 중...')
  const [searchText, setSearchText] = useState('')
  const [selectedPapers, setSelectedPapers] = useState<ReaderPaper[]>([])

  // 내 라이브러리 논문 목록 불러오기
  useEffect(() => {
    let ignore = false

    getLibraryPapers()
      .then((result) => {
        if (ignore) return
        setPapers(result.map((paper) => ({ userPaperId: paper.userPaperId, title: getPaperTitle(paper) })))
        setMessage(result.length === 0 ? '라이브러리에 논문이 없습니다.' : '')
      })
      .catch((error) => {
        if (!ignore) setMessage(error instanceof Error ? error.message : '논문 목록을 불러오지 못했습니다.')
      })

    return () => {
      ignore = true
    }
  }, [])

  const filteredPapers = papers
    .filter((paper) => !excludePaperIds.includes(paper.userPaperId))
    .filter((paper) => paper.title.toLowerCase().includes(searchText.toLowerCase()))

  const isSelected = (paper: ReaderPaper) => selectedPapers.some((item) => item.userPaperId === paper.userPaperId)

  const togglePaper = (paper: ReaderPaper) => {
    if (isSelected(paper)) {
      setSelectedPapers(selectedPapers.filter((item) => item.userPaperId !== paper.userPaperId))
    } else if (maxSelect === 1) {
      setSelectedPapers([paper])
    } else if (maxSelect === undefined || selectedPapers.length < maxSelect) {
      setSelectedPapers([...selectedPapers, paper])
    }
  }

  return (
    <div className={`paper-select-overlay paper-select-overlay-${overlay}`} onClick={onClose}>
      <div className="paper-select-modal" onClick={(event) => event.stopPropagation()}>
        <div className="paper-select-header">
          <h2 className="paper-select-title">{title}</h2>
          <button className="paper-select-close" type="button" onClick={onClose}>x</button>
        </div>

        <label className="paper-select-search">
          <SearchIcon size={24} />
          <input className="paper-select-search-input" type="text" placeholder="논문 검색" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
        </label>

        <div className="paper-select-list">
          {message && <p className="paper-select-message">{message}</p>}
          {filteredPapers.map((paper) => (
            <label key={paper.userPaperId} className="paper-select-item">
              <input className="paper-select-checkbox" type="checkbox" checked={isSelected(paper)} onChange={() => togglePaper(paper)} />
              {paper.title}
            </label>
          ))}
        </div>

        <div className="paper-select-buttons">
          {showCancel && (
            <button className="paper-select-button" type="button" onClick={onClose}>취소</button>
          )}
          <button className="paper-select-button" type="button" disabled={selectedPapers.length < Math.max(minSelect, 1)} onClick={() => onConfirm(selectedPapers)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default ReaderPaperSelectModal
