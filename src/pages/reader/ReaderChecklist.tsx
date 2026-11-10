import '../../styles/readerSummary.css'
import type { Checklist, ChecklistResult, ChecklistResultStatus } from './readerApi'

type ReaderChecklistProps = {
  checklist: Checklist | null
  message: string
  onShowEvidence: (result: ChecklistResult) => void
  onClose: () => void
}

// 판정 개수를 보여줄 순서
const statusOrder: ChecklistResultStatus[] = ['충족', '미충족', '불명확', '해당없음']

const statusClassName: Record<ChecklistResultStatus, string> = {
  충족: 'reader-checklist-status-met',
  미충족: 'reader-checklist-status-not-met',
  불명확: 'reader-checklist-status-unclear',
  해당없음: 'reader-checklist-status-na',
}

// 피그마 화면이 없어서 요약 카드와 같은 모양으로 만들었습니다.
function ReaderChecklist({ checklist, message, onShowEvidence, onClose }: ReaderChecklistProps) {
  const isDone = checklist?.status === 'completed'
  const results = [...(checklist?.results ?? [])].sort((a, b) => a.displayOrder - b.displayOrder)

  return (
    <div className="reader-summary">
      <div className="reader-summary-header">
        <h2 className="reader-summary-title">🔬 재현 가능성</h2>
        <button className="reader-summary-close" type="button" onClick={onClose}>x</button>
      </div>

      {!isDone ? (
        <p className="reader-summary-content">{message}</p>
      ) : (
        <>
          {checklist.summaryCounts && (
            <div className="reader-checklist-counts">
              {statusOrder.map((status) => (
                <span key={status} className={`reader-checklist-status ${statusClassName[status]}`}>
                  {status} {checklist.summaryCounts?.[status] ?? 0}
                </span>
              ))}
            </div>
          )}

          {results.map((result) => (
            <div key={result.itemCode} className="reader-summary-section">
              <div className="reader-summary-section-header">
                <h3 className="reader-summary-section-title">
                  <span className="reader-checklist-category">{result.category}</span>
                  {result.name}
                </h3>
                <span className={`reader-checklist-status ${statusClassName[result.status]}`}>{result.status}</span>
              </div>

              {result.evidenceQuote && <p className="reader-summary-content">"{result.evidenceQuote}"</p>}

              {result.pageNo !== null && (
                <button className="reader-checklist-evidence" type="button" onClick={() => onShowEvidence(result)}>
                  📄 p.{result.pageNo} 근거 확인
                </button>
              )}
            </div>
          ))}

          <p className="reader-checklist-disclaimer">{checklist.disclaimer}</p>
        </>
      )}
    </div>
  )
}

export default ReaderChecklist
