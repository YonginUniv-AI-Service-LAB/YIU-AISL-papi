import { useState } from 'react'
import '../../styles/readerCompare.css'
import type { Comparison } from './readerApi'

type ReaderCompareProps = {
  paperA: string
  paperB: string
  comparison: Comparison | null
  message: string
  onShowEvidence: (field: string, position: number) => void
  onClose: () => void
}

// 비교표 항목 (key는 백엔드 tableData의 이름)
const compareFields = [
  { key: 'researchPurpose', label: '연구 목적' },
  { key: 'coreIdea', label: '핵심 아이디어' },
  { key: 'methodology', label: '핵심 방법론' },
  { key: 'model', label: '모델' },
  { key: 'dataset', label: '데이터셋' },
  { key: 'metric', label: '평가 지표' },
  { key: 'result', label: '주요 결과' },
  { key: 'strength', label: '장점' },
  { key: 'limitation', label: '한계점' },
]

function ReaderCompare({ paperA, paperB, comparison, message, onShowEvidence, onClose }: ReaderCompareProps) {
  const [openRow, setOpenRow] = useState<string | null>(null)

  const toggleRow = (key: string) => {
    setOpenRow(openRow === key ? null : key)
  }

  const tableData = comparison?.tableData

  return (
    <div className="reader-compare">
      <div className="reader-compare-header">
        <h2 className="reader-compare-title">논문 비교</h2>
        <button className="reader-compare-close" type="button" onClick={onClose}>x</button>
      </div>

      {!tableData ? (
        <p className="reader-compare-summary-text">{message}</p>
      ) : (
        <>
          <div className="reader-compare-table">
            <div className="reader-compare-row reader-compare-row-head">
              <span>비교 항목</span>
              <span>{paperA}</span>
              <span>{paperB}</span>
            </div>

            {compareFields.map((field) => (
              <div key={field.key} className="reader-compare-row-group">
                <div className="reader-compare-row">
                  <button className="reader-compare-label" type="button" onClick={() => toggleRow(field.key)}>
                    {field.label}
                    <span className={`reader-compare-chevron ${openRow === field.key ? 'reader-compare-chevron-open' : ''}`}>⌄</span>
                  </button>
                  <span>{tableData[field.key]?.['1']}</span>
                  <span>{tableData[field.key]?.['2']}</span>
                </div>

                {openRow === field.key && (
                  <div className="reader-compare-row reader-compare-row-detail">
                    <span className="reader-compare-detail-label">근거 확인</span>
                    <button className="reader-compare-pdf-button" type="button" onClick={() => onShowEvidence(field.key, 1)}>📄 PDF에서 보기</button>
                    <button className="reader-compare-pdf-button" type="button" onClick={() => onShowEvidence(field.key, 2)}>📄 PDF에서 보기</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {comparison?.narrative?.comparisonSummary && (
            <div className="reader-compare-summary">
              <h3 className="reader-compare-summary-title">비교 요약</h3>
              <p className="reader-compare-summary-text">{comparison.narrative.comparisonSummary}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReaderCompare
