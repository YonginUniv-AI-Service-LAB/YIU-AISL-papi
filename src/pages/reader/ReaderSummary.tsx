import { useState } from 'react'
import '../../styles/readerSummary.css'

type ReaderSummaryProps = {
  onClose: () => void
}

const summarySections = [
  { title: '한 줄 요약', page: 'p.3 §2', content: '긴 문서 기반 RAG 성능 향상을 위한 새로운 검색 전략을 제안한 논문입니다.' },
  { title: '연구 목적', page: 'p.4 §1', content: '기존 RAG는 긴 문서에서 필요한 정보를 충분히 검색하지 못하는 문제가 있습니다.' },
  { title: '핵심 아이디어', page: 'p.5 §2', content: '문서를 의미 단위로 분할하고 중요도를 반영한 검색 방식을 제안합니다.' },
  { title: '핵심 방법론', page: 'p.6 §3', content: 'Dense Retriever + Cross Encoder 기반 검색 구조를 사용합니다.' },
  { title: '결과', page: 'p.8 §1', content: 'Natural Questions 데이터셋에서 기존 방법 대비 F1 3.2% 향상되었습니다.\n긴 문서에서도 검색 성능이 안정적으로 향상됨을 확인했습니다.' },
  { title: '한계점', page: 'p.9 §2', content: '추론 시간이 증가하며 대규모 환경에서는 추가 검증이 필요합니다.' },
]

const glossary = [
  { term: 'Dense Retriever', meaning: '질문과 의미가 가까운 문서를 검색하는 모델' },
  { term: 'Cross Encoder', meaning: '질문과 문서를 함께 입력하여 관련성을 계산하는 모델' },
]

function ReaderSummary({ onClose }: ReaderSummaryProps) {
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(true)

  return (
    <div className="reader-summary">
      <div className="reader-summary-header">
        <h2 className="reader-summary-title">📄 논문 요약</h2>
        <button className="reader-summary-close" type="button" onClick={onClose}>x</button>
      </div>

      {summarySections.map((section) => (
        <div key={section.title} className="reader-summary-section">
          <div className="reader-summary-section-header">
            <h3 className="reader-summary-section-title">{section.title}</h3>
            <span className="reader-summary-page">[{section.page}]</span>
          </div>
          <p className="reader-summary-content">{section.content}</p>
        </div>
      ))}

      <div className="reader-summary-section">
        <div className="reader-summary-section-header">
          <button className="reader-summary-glossary-toggle" type="button" onClick={() => setIsGlossaryOpen(!isGlossaryOpen)}>
            용어집
            <span className={`reader-summary-chevron ${isGlossaryOpen ? 'reader-summary-chevron-open' : ''}`}>⌄</span>
          </button>
          <span className="reader-summary-page">[p.2 §1]</span>
        </div>

        {isGlossaryOpen && glossary.map((item) => (
          <p key={item.term} className="reader-summary-content">
            <span className="reader-summary-term">{item.term}</span>
            <br />
            {item.meaning}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ReaderSummary
