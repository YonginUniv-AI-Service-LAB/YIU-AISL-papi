import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import '../../styles/readerChat.css'
import { ArrowUpIcon } from './ReaderIcons'
import ReaderPaperSelectModal from './ReaderPaperSelectModal'
import ReaderSummary from './ReaderSummary'
import ReaderCompare from './ReaderCompare'
import ReaderChecklist from './ReaderChecklist'
import { ApiError, getChunk, getComparison, getChecklist, getComparisonCitations, getMessages, getSuggestedQuestions, getSummary, requestChecklist, requestComparison, requestSummary, sendQuestion, waitUntilDone } from './readerApi'
import type { Checklist, ChecklistResult, Citation, Comparison, Summary } from './readerApi'
import type { EvidenceTarget, ReaderPaper } from './ReaderPage'

type ReaderChatProps = {
  roomId: string
  isViewerOpen: boolean
  onOpenViewer: () => void
  comparePapers: ReaderPaper[]
  onCompare: (papers: ReaderPaper[]) => void
  onCloseCompare: () => void
  onShowEvidence: (paperId: string, chunkId: number | null, pageNo: number | null) => void
  onShowComparisonEvidence: (target: EvidenceTarget) => void
  onShowPaperEvidence: (target: EvidenceTarget) => void
  onRoomTitleChange: () => void
}

type ChatMessage = {
  role: 'user' | 'ai'
  text: string
  citations: Citation[]
  fromSuggestion?: boolean
}

const toolButtons = ['추천 질문', '비교', '요약', '재현 가능성']

// 백엔드에 질문 API(45번)가 아직 없을 때 보여줄 안내 문구입니다.
const NO_QUESTION_API_MESSAGE = '아직 질문 기능이 서버와 연결되지 않았어요. 질문 API가 추가되면 실제 답변이 표시됩니다.'

function ReaderChat({ roomId, isViewerOpen, onOpenViewer, comparePapers, onCompare, onCloseCompare, onShowEvidence, onShowComparisonEvidence, onShowPaperEvidence, onRoomTitleChange }: ReaderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null)
  const [isAnswering, setIsAnswering] = useState(false)
  const answerController = useRef<AbortController | null>(null)

  const [isSummarySelectOpen, setIsSummarySelectOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryMessage, setSummaryMessage] = useState('')

  const [isCompareSelectOpen, setIsCompareSelectOpen] = useState(false)
  const [comparison, setComparison] = useState<Comparison | null>(null)
  const [compareMessage, setCompareMessage] = useState('')

  const [isChecklistSelectOpen, setIsChecklistSelectOpen] = useState(false)
  const [checklistPaper, setChecklistPaper] = useState<ReaderPaper | null>(null)
  const [checklist, setChecklist] = useState<Checklist | null>(null)
  const [checklistMessage, setChecklistMessage] = useState('')

  // 요약·비교 결과를 기다리는 중에 창을 닫거나 다시 요청하면 이전 결과는 무시합니다.
  const summaryRequestId = useRef(0)
  const compareRequestId = useRef(0)
  const checklistRequestId = useRef(0)

  // 이전 대화 내용과 추천 질문 불러오기
  useEffect(() => {
    let ignore = false

    getMessages(roomId)
      .then((result) => {
        if (ignore) return
        // 백엔드는 최신 메시지부터 주므로 화면에는 오래된 순서로 뒤집어서 보여줍니다.
        const history = [...result].reverse().map((message): ChatMessage => ({
          role: message.role === 'user' ? 'user' : 'ai',
          text: message.content,
          citations: message.citations,
        }))
        setMessages(history)
      })
      .catch(() => {
        if (!ignore) setMessages([])
      })

    getSuggestedQuestions(roomId)
      .then((result) => {
        if (!ignore) setSuggestedQuestions(result.map((item) => item.question))
      })
      .catch(() => {
        if (!ignore) setSuggestedQuestions([])
      })

    return () => {
      ignore = true
      answerController.current?.abort()
      summaryRequestId.current += 1
      compareRequestId.current += 1
      checklistRequestId.current += 1
    }
  }, [roomId])

  const handleToolClick = (tool: string) => {
    if (tool === '추천 질문') {
      setIsSuggestionOpen(!isSuggestionOpen)
    }
    if (tool === '요약') {
      setIsSummarySelectOpen(true)
    }
    if (tool === '비교') {
      setIsCompareSelectOpen(true)
    }
    if (tool === '재현 가능성') {
      setIsChecklistSelectOpen(true)
    }
  }

  // 마지막 AI 말풍선(지금 답변 중인 말풍선)만 바꿉니다.
  const updateLastAnswer = (update: (message: ChatMessage) => ChatMessage) => {
    setMessages((current) => current.map((message, index) => (index === current.length - 1 ? update(message) : message)))
  }

  const askQuestion = async (question: string, fromSuggestion: boolean) => {
    if (isAnswering) return

    setMessages((current) => [
      ...current,
      { role: 'user', text: question, citations: [], fromSuggestion },
      { role: 'ai', text: '', citations: [] },
    ])
    setIsAnswering(true)

    const controller = new AbortController()
    answerController.current = controller

    try {
      await sendQuestion(roomId, question, {
        onToken: (text) => updateLastAnswer((message) => ({ ...message, text: message.text + text })),
        onCitation: (citation) => updateLastAnswer((message) => ({ ...message, citations: [...message.citations, citation] })),
        // 첫 질문이 끝나면 서버가 대화 이름을 자동으로 바꾸므로 사이드바를 다시 불러옵니다.
        onDone: () => onRoomTitleChange(),
      }, controller.signal)
    } catch (error) {
      if (controller.signal.aborted) return

      // 404·405는 질문 API가 아직 백엔드에 없다는 뜻입니다.
      const isMissingApi = error instanceof ApiError && (error.status === 404 || error.status === 405)
      const errorText = isMissingApi ? NO_QUESTION_API_MESSAGE : error instanceof Error ? error.message : '답변을 받지 못했습니다.'
      updateLastAnswer((message) => ({ ...message, text: message.text ? `${message.text}\n\n(${errorText})` : errorText }))
    } finally {
      if (answerController.current === controller) {
        answerController.current = null
        setIsAnswering(false)
      }
    }
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

  const showCitation = (key: string, citation: Citation) => {
    setActiveEvidence(key)
    onShowEvidence(citation.paperId, citation.chunkId, citation.pageNo)
  }

  const startSummary = async (paper: ReaderPaper) => {
    const requestId = ++summaryRequestId.current

    setIsSummarySelectOpen(false)
    setIsSummaryOpen(true)
    setSummary(null)
    setSummaryMessage('요약을 만드는 중이에요. 잠시만 기다려주세요...')
    onCloseCompare()
    closeChecklist()

    try {
      await requestSummary(paper.userPaperId, roomId)
      const result = await waitUntilDone(() => getSummary(paper.userPaperId), () => requestId !== summaryRequestId.current)
      if (requestId !== summaryRequestId.current) return

      setSummary(result)
      if (result.status === 'failed') setSummaryMessage('요약을 만들지 못했습니다. 잠시 후 다시 시도해주세요.')
    } catch (error) {
      if (requestId === summaryRequestId.current) {
        setSummaryMessage(error instanceof Error ? error.message : '요약을 불러오지 못했습니다.')
      }
    }
  }

  const closeSummary = () => {
    summaryRequestId.current += 1
    setIsSummaryOpen(false)
  }

  const startComparison = async (papers: ReaderPaper[]) => {
    const requestId = ++compareRequestId.current

    setIsCompareSelectOpen(false)
    closeSummary()
    closeChecklist()
    setComparison(null)
    setCompareMessage('두 논문을 비교하는 중이에요. 잠시만 기다려주세요...')
    onCompare(papers)

    try {
      const { comparisonId } = await requestComparison(papers.map((paper) => paper.userPaperId), roomId)
      const result = await waitUntilDone(() => getComparison(comparisonId), () => requestId !== compareRequestId.current)
      if (requestId !== compareRequestId.current) return

      setComparison(result)
      if (result.status === 'failed') setCompareMessage('비교 결과를 만들지 못했습니다. 잠시 후 다시 시도해주세요.')
    } catch (error) {
      if (requestId === compareRequestId.current) {
        setCompareMessage(error instanceof Error ? error.message : '비교 결과를 불러오지 못했습니다.')
      }
    }
  }

  const closeComparison = () => {
    compareRequestId.current += 1
    onCloseCompare()
  }

  const startChecklist = async (paper: ReaderPaper) => {
    const requestId = ++checklistRequestId.current

    setIsChecklistSelectOpen(false)
    closeSummary()
    onCloseCompare()
    setChecklistPaper(paper)
    setChecklist(null)
    setChecklistMessage('재현 가능성을 확인하는 중이에요. 잠시만 기다려주세요...')

    try {
      await requestChecklist(paper.userPaperId, roomId)
      const result = await waitUntilDone(() => getChecklist(paper.userPaperId), () => requestId !== checklistRequestId.current)
      if (requestId !== checklistRequestId.current) return

      setChecklist(result)
      if (result.status === 'failed') setChecklistMessage('재현 가능성을 확인하지 못했습니다. 잠시 후 다시 시도해주세요.')
    } catch (error) {
      if (requestId === checklistRequestId.current) {
        setChecklistMessage(error instanceof Error ? error.message : '재현 가능성 결과를 불러오지 못했습니다.')
      }
    }
  }

  function closeChecklist() {
    checklistRequestId.current += 1
    setChecklistPaper(null)
  }

  const showChecklistEvidence = async (result: ChecklistResult) => {
    if (!checklistPaper || result.pageNo === null) return

    let bbox = null
    if (result.chunkId !== null) {
      bbox = (await getChunk(checklistPaper.userPaperId, result.chunkId).catch(() => null))?.bbox ?? null
    }

    onShowPaperEvidence({ userPaperId: checklistPaper.userPaperId, pageNo: result.pageNo, bbox })
  }

  const showComparisonEvidence = async (field: string, position: number) => {
    if (!comparison) return

    const paper = comparison.papers.find((item) => item.position === position)
    if (!paper) return

    try {
      const citations = await getComparisonCitations(comparison.comparisonId, field)
      const citation = citations.find((item) => item.position === position)

      if (!citation) {
        alert('이 항목의 근거를 찾지 못했습니다.')
        return
      }

      let bbox = null
      if (citation.chunkId !== null) {
        bbox = (await getChunk(paper.userPaperId, citation.chunkId).catch(() => null))?.bbox ?? null
      }

      onShowComparisonEvidence({ userPaperId: paper.userPaperId, pageNo: citation.pageNo, bbox })
    } catch (error) {
      alert(error instanceof Error ? error.message : '근거를 불러오지 못했습니다.')
    }
  }

  return (
    <section className="reader-chat">
      <div className="reader-chat-tools">
        {isViewerOpen ? (
          toolButtons.map((tool) => (
            <button key={tool} className={`reader-chat-tool-button ${(tool === '요약' && isSummaryOpen) || (tool === '비교' && comparePapers.length > 0) || (tool === '추천 질문' && isSuggestionOpen) || (tool === '재현 가능성' && checklistPaper !== null) ? 'reader-chat-tool-button-active' : ''}`} type="button" onClick={() => handleToolClick(tool)}>{tool}</button>
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
              <p className="reader-chat-bubble-ai-text">{message.text || '답변을 만드는 중이에요...'}</p>
              {message.citations.map((citation) => {
                const key = `${index}-${citation.rank}`

                return (
                  <button key={key} className={`reader-chat-evidence-button ${activeEvidence === key ? 'reader-chat-evidence-button-active' : ''}`} type="button" onClick={() => showCitation(key, citation)}>
                    📄 논문에서 근거 확인{message.citations.length > 1 ? ` ${citation.rank}` : ''}
                  </button>
                )
              })}
            </div>
          )
        )}
      </div>

      {(messages.length === 0 || isSuggestionOpen) && suggestedQuestions.length > 0 && (
        <div className="reader-chat-suggestions">
          <p className="reader-chat-suggestions-title">추천 질문</p>
          <div className="reader-chat-suggestions-list">
            {suggestedQuestions.map((question) => (
              <button key={question} className="reader-chat-suggestion" type="button" onClick={() => { setIsSuggestionOpen(false); askQuestion(question, true) }}>
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
          maxSelect={1}
          overlay="panel"
          onClose={() => setIsSummarySelectOpen(false)}
          onConfirm={(papers) => startSummary(papers[0])}
        />
      )}

      {isSummaryOpen && <ReaderSummary summary={summary} message={summaryMessage} onClose={closeSummary} />}

      {isChecklistSelectOpen && (
        <ReaderPaperSelectModal
          title="재현 가능성을 확인할 논문을 선택하세요."
          confirmLabel="선택"
          showCancel
          maxSelect={1}
          overlay="panel"
          onClose={() => setIsChecklistSelectOpen(false)}
          onConfirm={(papers) => startChecklist(papers[0])}
        />
      )}

      {checklistPaper && (
        <ReaderChecklist checklist={checklist} message={checklistMessage} onShowEvidence={showChecklistEvidence} onClose={closeChecklist} />
      )}

      {isCompareSelectOpen && (
        <ReaderPaperSelectModal
          title="비교할 논문을 선택하세요"
          confirmLabel="비교하기"
          showCancel
          minSelect={2}
          maxSelect={2}
          overlay="panel"
          onClose={() => setIsCompareSelectOpen(false)}
          onConfirm={startComparison}
        />
      )}

      {comparePapers.length >= 2 && (
        <ReaderCompare
          paperA={comparePapers[0].title}
          paperB={comparePapers[1].title}
          comparison={comparison}
          message={compareMessage}
          onShowEvidence={showComparisonEvidence}
          onClose={closeComparison}
        />
      )}

      <form className="reader-chat-input-box" onSubmit={handleSubmit}>
        <input className="reader-chat-input" type="text" placeholder="논문에 대해 질문해보세요." value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
        <button className="reader-chat-send-button" type="submit" aria-label="전송" disabled={isAnswering}>
          <ArrowUpIcon />
        </button>
      </form>
    </section>
  )
}

export default ReaderChat
