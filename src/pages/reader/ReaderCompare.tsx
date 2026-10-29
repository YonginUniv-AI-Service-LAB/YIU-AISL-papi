import { useState } from 'react'
import '../../styles/readerCompare.css'

type ReaderCompareProps = {
  paperA: string
  paperB: string
  onClose: () => void
}

const compareRows = [
  { label: '연구 목적', a: '검색 성능 향상', b: '답변 생성 성능 향상' },
  { label: '핵심 아이디어', a: 'Dense Retriever 개선', b: 'Generator 개선' },
  { label: '핵심 방법론', a: '검색 성능 향상', b: '답변 생성 성능 향상' },
  { label: '모델', a: 'DPR', b: 'RAG + Llama' },
  { label: '데이터셋', a: 'Natural Questions', b: 'HotpotQA' },
  { label: '평가 지표', a: 'F1, EM', b: 'F1, Recall' },
  { label: '주요 결과', a: 'F1 82.4', b: 'F1 84.1' },
  { label: '장점', a: '검색 정확도 우수', b: '생성 품질 우수' },
  { label: '한계점', a: '계산량 증가', b: '추론 시간 증가' },
]

const compareSummary = '두 논문은 모두 RAG 성능 향상을 목표로 하지만, 논문 A는 검색 성능 개선에, 논문 B는 답변 생성 성능 개선에 초점을 둡니다.'

function ReaderCompare({ paperA, paperB, onClose }: ReaderCompareProps) {
  const [openRow, setOpenRow] = useState<string | null>(null)

  const toggleRow = (label: string) => {
    setOpenRow(openRow === label ? null : label)
  }

  return (
    <div className="reader-compare">
      <div className="reader-compare-header">
        <h2 className="reader-compare-title">논문 비교</h2>
        <button className="reader-compare-close" type="button" onClick={onClose}>x</button>
      </div>

      <div className="reader-compare-table">
        <div className="reader-compare-row reader-compare-row-head">
          <span>비교 항목</span>
          <span>{paperA}</span>
          <span>{paperB}</span>
        </div>

        {compareRows.map((row) => (
          <div key={row.label} className="reader-compare-row-group">
            <div className="reader-compare-row">
              <button className="reader-compare-label" type="button" onClick={() => toggleRow(row.label)}>
                {row.label}
                <span className={`reader-compare-chevron ${openRow === row.label ? 'reader-compare-chevron-open' : ''}`}>⌄</span>
              </button>
              <span>{row.a}</span>
              <span>{row.b}</span>
            </div>

            {openRow === row.label && (
              <div className="reader-compare-row reader-compare-row-detail">
                <span className="reader-compare-detail-label">근거 확인</span>
                <button className="reader-compare-pdf-button" type="button">📄 PDF에서 보기</button>
                <button className="reader-compare-pdf-button" type="button">📄 PDF에서 보기</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="reader-compare-summary">
        <h3 className="reader-compare-summary-title">비교 요약</h3>
        <p className="reader-compare-summary-text">{compareSummary}</p>
      </div>
    </div>
  )
}

export default ReaderCompare
