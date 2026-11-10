import { useState } from 'react'
import '../../styles/readerSummary.css'
import type { Summary, SummaryCitation } from './readerApi'

type ReaderSummaryProps = {
  summary: Summary | null
  message: string
  onShowEvidence: (citation: SummaryCitation) => void
  onClose: () => void
}

// 피그마 순서대로 보여줄 요약 항목 (key는 백엔드 content의 이름)
const summaryFields = [
  { key: 'oneLineSummary', title: '한 줄 요약' },
  { key: 'researchPurpose', title: '연구 목적' },
  { key: 'coreIdea', title: '핵심 아이디어' },
  { key: 'methodology', title: '핵심 방법론' },
  { key: 'results', title: '결과' },
  { key: 'limitations', title: '한계점' },
] as const

function ReaderSummary({ summary, message, onShowEvidence, onClose }: ReaderSummaryProps) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(true)

  const getCitation = (field: string) =>
    summary?.citations.find((item) => item.field === field && item.pageNo !== null) ?? null

  const getPageLabel = (citation: SummaryCitation) =>
    citation.sectionLabel ? `p.${citation.pageNo} ${citation.sectionLabel}` : `p.${citation.pageNo}`

  return (
    <div className="reader-summary">
      <div className="reader-summary-header">
        <h2 className="reader-summary-title">📄 논문 요약</h2>
        <button className="reader-summary-close" type="button" onClick={onClose}>x</button>
      </div>

      {!summary?.content ? (
        <p className="reader-summary-content">{message}</p>
      ) : (
        <>
          {summaryFields.map((field) => {
            const citation = getCitation(field.key)

            return (
              <div key={field.key} className="reader-summary-section">
                <div className="reader-summary-section-header">
                  <h3 className="reader-summary-section-title">{field.title}</h3>
                  {citation && (
                    <button className="reader-summary-page" type="button" title="PDF에서 보기" onClick={() => onShowEvidence(citation)}>
                      [{getPageLabel(citation)}]
                    </button>
                  )}
                </div>
                <p className="reader-summary-content">{summary.content?.[field.key]}</p>
              </div>
            )
          })}

          {summary.glossary.length > 0 && (
            <div className="reader-summary-section">
              <div className="reader-summary-section-header">
                <button className="reader-summary-glossary-toggle" type="button" onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}>
                  용어집
                  <span className={`reader-summary-chevron ${isGlossaryOpen ? 'reader-summary-chevron-open' : ''}`}>⌄</span>
                </button>
              </div>

              {isGlossaryOpen && summary.glossary.map((item) => (
                <p key={item.term} className="reader-summary-content">
                  <span className="reader-summary-term">{item.term}</span>
                  <br />
                  {item.explanation}
                </p>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ReaderSummary
