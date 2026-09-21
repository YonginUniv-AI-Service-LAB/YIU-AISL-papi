import { useState } from 'react'
import '../../styles/readerPaperSelectModal.css'
import { SearchIcon } from './ReaderIcons'

type ReaderPaperSelectModalProps = {
  title: string
  confirmLabel: string
  showCancel?: boolean
  overlay: 'page' | 'panel'
  onClose: () => void
  onConfirm: (selectedPapers: string[]) => void
}

const papers = ['Paper Title_1', 'Paper Title_2', 'Paper Title_3', 'Paper Title_4']

function ReaderPaperSelectModal({ title, confirmLabel, showCancel = false, overlay, onClose, onConfirm }: ReaderPaperSelectModalProps) {
  const [searchText, setSearchText] = useState('')
  const [selectedPapers, setSelectedPapers] = useState<string[]>([])

  const filteredPapers = papers.filter((paper) => paper.toLowerCase().includes(searchText.toLowerCase()))

  const togglePaper = (paper: string) => {
    if (selectedPapers.includes(paper)) {
      setSelectedPapers(selectedPapers.filter((item) => item !== paper))
    } else {
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
          {filteredPapers.map((paper) => (
            <label key={paper} className="paper-select-item">
              <input className="paper-select-checkbox" type="checkbox" checked={selectedPapers.includes(paper)} onChange={() => togglePaper(paper)} />
              {paper}
            </label>
          ))}
        </div>

        <div className="paper-select-buttons">
          {showCancel && (
            <button className="paper-select-button" type="button" onClick={onClose}>취소</button>
          )}
          <button className="paper-select-button" type="button" onClick={() => onConfirm(selectedPapers)}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}

export default ReaderPaperSelectModal
