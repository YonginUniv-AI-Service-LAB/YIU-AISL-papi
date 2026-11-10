import { useEffect, useState } from 'react'
import '../../styles/readerPaperSelectModal.css'
import { getComparisonHistory } from './readerApi'
import type { ComparisonHistory } from './readerApi'
 
type ReaderCompareHistoryProps = {
  onClose: () => void
  onNewCompare: () => void
  onOpen: (comparisonId: string) => void
}
 
// 64번: 비교 버튼을 누르면 나오는 창. 이전 비교를 다시 보거나 새로 비교할 수 있어요.
function ReaderCompareHistory({ onClose, onNewCompare, onOpen }: ReaderCompareHistoryProps) {
  const [history, setHistory] = useState<ComparisonHistory[]>([])
  const [message, setMessage] = useState('불러오는 중...')
 
  useEffect(() => {
    let ignore = false
 
    getComparisonHistory()
      .then((result) => {
        if (ignore) return
        // 다 만들어진 비교만 보여줘요
        const readyHistory = result.filter((item) => item.status === 'completed')
        // 이전 비교가 하나도 없으면 바로 논문 선택 창으로 넘어가요
        if (readyHistory.length === 0) {
          onNewCompare()
          return
        }
        setHistory(readyHistory)
        setMessage('')
      })
      .catch(() => {
        if (!ignore) setMessage('이전 비교를 불러오지 못했어요.')
      })
 
    return () => {
      ignore = true
    }
    // 창이 열릴 때 한 번만 불러오면 돼요.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
 
  const getTitle = (item: ComparisonHistory) =>
    [...item.papers]
      .sort((a, b) => a.position - b.position)
      .map((paper) => paper.title)
      .join('  vs  ')
 
  const getDate = (createdAt: string) => {
    const date = new Date(createdAt)
    return `${date.getMonth() + 1}월 ${date.getDate()}일`
  }
 
  return (
    <div className="paper-select-overlay paper-select-overlay-panel" onClick={onClose}>
      <div className="paper-select-modal" onClick={(event) => event.stopPropagation()}>
        <div className="paper-select-header">
          <h2 className="paper-select-title">비교</h2>
          <button className="paper-select-close" type="button" onClick={onClose}>x</button>
        </div>
 
        <button className="paper-select-button compare-history-new" type="button" onClick={onNewCompare}>+ 새로 비교하기</button>
 
        <p className="compare-history-label">이전 비교</p>
        <div className="paper-select-list">
          {message && <p className="paper-select-message">{message}</p>}
          {history.map((item) => (
            <button key={item.comparisonId} className="paper-select-item compare-history-item" type="button" onClick={() => onOpen(item.comparisonId)}>
              <span className="compare-history-title">{getTitle(item)}</span>
              <span className="paper-select-status">{getDate(item.createdAt)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
 
export default ReaderCompareHistory
 