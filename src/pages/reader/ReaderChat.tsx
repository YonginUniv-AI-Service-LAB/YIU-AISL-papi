import { useState } from 'react'
import type { FormEvent } from 'react'
import '../../styles/readerChat.css'
import { ArrowUpIcon } from './ReaderIcons'
import ReaderPaperSelectModal from './ReaderPaperSelectModal'
import ReaderSummary from './ReaderSummary'
import ReaderCompare from './ReaderCompare'

type ReaderChatProps = {
  isViewerOpen: boolean
  onOpenViewer: () => void
  comparePapers: string[]
  onCompare: (papers: string[]) => void
  onCloseCompare: () => void
  evidenceId: number | null
  onShowEvidence: (id: number) => void
}

type Message = {
  role: 'user' | 'ai'
  text: string
  fromSuggestion?: boolean
}

const toolButtons = ['추천 질문', '비교', '요약', '재현 가능성']

const suggestedQuestions = [
  '이 논문의 핵심 기여는 무엇인가요?',
  '어떤 모델을 사용했나요?',
  '실험 환경은 어떻게 되나요?',
  '이 논문의 한계점은 무엇인가요?',
]

const sampleAnswers: Record<string, string> = {
  '어떤 모델을 사용했나요?': '이 논문에서는 Transformer 기반 모델을 사용하며 검색 증강 생성(RAG)을 적용하여 외부 문서를 검색한 후 생성 모델에 전달합니다.',
}

const defaultAnswer = 'AI 답변이 여기에 표시됩니다. 서버와 연결되면 실제 답변으로 바뀌어요.'

function ReaderChat({ isViewerOpen, onOpenViewer, comparePapers, onCompare, onCloseCompare, evidenceId, onShowEvidence }: ReaderChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isSummarySelectOpen, setIsSummarySelectOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [isCompareSelectOpen, setIsCompareSelectOpen] = useState(false)

  const handleToolClick = (tool: string) => {
    if (tool === '요약') {
      setIsSummarySelectOpen(true)
    }
    if (tool === '비교') {
      setIsCompareSelectOpen(true)
    }
  }

  const askQuestion = (question: string, fromSuggestion: boolean) => {
    const answer = sampleAnswers[question] ?? defaultAnswer

    setMessages([
      ...messages,
      { role: 'user', text: question, fromSuggestion },
      { role: 'ai', text: answer },
    ])
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const question = inputValue.trim()
    if (!question) {
      return
    }

    askQuestion(question, false)
    setInputValue('')
  }

  return (
    <section className="reader-chat">
      <div className="reader-chat-tools">
        {isViewerOpen ? (
          toolButtons.map((tool) => (
            <button key={tool} className={`reader-chat-tool-button ${(tool === '요약' && isSummaryOpen) || (tool === '비교' && comparePapers.length > 0) ? 'reader-chat-tool-button-active' : ''}`} type="button" onClick={() => handleToolClick(tool)}>{tool}</button>
          ))
        ) : (
          <button className="reader-chat-tool-button" type="button" onClick={onOpenViewer}>PDF 뷰어 열기</button>
        )}
      </div>

      <div className="reader-chat-messages">
        {messages.map((message, index) =>
          message.role === 'user' ? (
            <div key={index} className={`reader-chat-bubble-user ${message.fromSuggestion ? 'reader-chat-bubble-user-suggested' : ''}`}>
              {message.text}
            </div>
          ) : (
            <div key={index} className="reader-chat-bubble-ai">
              <p className="reader-chat-bubble-ai-text">{message.text}</p>
              <button className={`reader-chat-evidence-button ${evidenceId === index ? 'reader-chat-evidence-button-active' : ''}`} type="button" onClick={() => onShowEvidence(index)}>📄 논문에서 근거 확인</button>
            </div>
          )
        )}
      </div>

      {messages.length === 0 && (
        <div className="reader-chat-suggestions">
          <p className="reader-chat-suggestions-title">추천 질문</p>
          <div className="reader-chat-suggestions-list">
            {suggestedQuestions.map((question) => (
              <button key={question} className="reader-chat-suggestion" type="button" onClick={() => askQuestion(question, true)}>
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {isSummarySelectOpen && (
        <ReaderPaperSelectModal
          title="요약할 논문을 선택하세요."
          confirmLabel="선택"
          showCancel
          overlay="panel"
          onClose={() => setIsSummarySelectOpen(false)}
          onConfirm={() => {
            setIsSummarySelectOpen(false)
            setIsSummaryOpen(true)
            onCloseCompare()
          }}
        />
      )}

      {isSummaryOpen && <ReaderSummary onClose={() => setIsSummaryOpen(false)} />}

      {isCompareSelectOpen && (
        <ReaderPaperSelectModal
          title="비교할 논문을 선택하세요"
          confirmLabel="비교하기"
          showCancel
          minSelect={2}
          overlay="panel"
          onClose={() => setIsCompareSelectOpen(false)}
          onConfirm={(papers) => {
            setIsCompareSelectOpen(false)
            setIsSummaryOpen(false)
            onCompare(papers)
          }}
        />
      )}

      {comparePapers.length >= 2 && <ReaderCompare paperA={comparePapers[0]} paperB={comparePapers[1]} onClose={onCloseCompare} />}

      <form className="reader-chat-input-box" onSubmit={handleSubmit}>
        <input className="reader-chat-input" type="text" placeholder="논문에 대해 질문해보세요." value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
        <button className="reader-chat-send-button" type="submit" aria-label="전송">
          <ArrowUpIcon />
        </button>
      </form>
    </section>
  )
}

export default ReaderChat
