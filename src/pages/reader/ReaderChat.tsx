import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import '../../styles/readerChat.css'
import { ArrowUpIcon } from './ReaderIcons'
import ReaderPaperSelectModal from './ReaderPaperSelectModal'
import ReaderSummary from './ReaderSummary'
import ReaderCompare from './ReaderCompare'
import ReaderChecklist from './ReaderChecklist'
import { cancelAnswer, getChunk, getComparison, getChecklist, getComparisonCitations, getMessage, getMessages, getSuggestedQuestions, getSummary, refreshSuggestedQuestions, requestChecklist, requestComparison, requestSummary, retryAnswer, sendQuestion, waitUntilDone } from './readerApi'
import type { Checklist, ChecklistResult, Citation, Comparison, QuestionStreamHandlers, Summary, SummaryCitation } from './readerApi'
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
  key: number // 화면에서 말풍선을 구분하는 번호
  messageId: number | null // 서버의 메시지 번호 (중지·다시 생성에 사용)
  role: 'user' | 'ai'
  status: string // pending, streaming, completed, failed, canceled
  text: string
  citations: Citation[]
  fromSuggestion?: boolean
}

let nextMessageKey = 0
const createMessage = (message: Omit<ChatMessage, 'key'>): ChatMessage => ({ ...message, key: nextMessageKey++ })

// 아직 답변을 만드는 중인 상태
const isInProgress = (status: string) => status === 'pending' || status === 'streaming'

const toolButtons = ['추천 질문', '비교', '요약', '재현 가능성']

function ReaderChat({ roomId, isViewerOpen, onOpenViewer, comparePapers, onCompare, onCloseCompare, onShowEvidence, onShowComparisonEvidence, onShowPaperEvidence, onRoomTitleChange }: ReaderChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [activeEvidence, setActiveEvidence] = useState<string | null>(null)
  const [isAnswering, setIsAnswering] = useState(false)
  const answerController = useRef<AbortController | null>(null)
  const answeringMessageId = useRef<number | null>(null)

  // 채팅 자동 스크롤: 맨 아래를 보고 있을 때만 새 메시지를 따라 내려가요.
  // (위로 스크롤해서 이전 대화를 읽는 중이면 끌어내리지 않아요)
  const messagesRef = useRef<HTMLDivElement>(null)
  const isNearBottom = useRef(true)

  const handleMessagesScroll = () => {
    const box = messagesRef.current
    if (!box) return
    isNearBottom.current = box.scrollHeight - box.scrollTop - box.clientHeight < 80
  }
  const [isRefreshingSuggestions, setIsRefreshingSuggestions] = useState(false)

  const [isSummarySelectOpen, setIsSummarySelectOpen] = useState(false)
  const [isSummaryOpen, setIsSummaryOpen] = useState(false)
  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryMessage, setSummaryMessage] = useState('')
  const [summaryPaper, setSummaryPaper] = useState<ReaderPaper | null>(null) // 요약 중인 논문 (페이지 태그 이동용)

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
        const history = [...result].reverse().map((message) => createMessage({
          messageId: message.messageId,
          role: message.role === 'user' ? 'user' : 'ai',
          status: message.status,
          text: message.content ?? '',
          citations: message.citations ?? [],
        }))
        setMessages(history)

        // 답변 중에 새로고침했다면, 답변이 끝날 때까지 기다렸다가 이어서 보여줍니다.
        const unfinished = history.find((message) => message.role === 'ai' && isInProgress(message.status))
        if (unfinished?.messageId) followUnfinishedAnswer(unfinished.key, unfinished.messageId, () => ignore)
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
      answeringMessageId.current = null
      setIsAnswering(false)
      summaryRequestId.current += 1
      compareRequestId.current += 1
      checklistRequestId.current += 1
    }
    // 대화방이 바뀔 때만 다시 불러오면 되므로 roomId만 넣었습니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // key가 같은 말풍선 하나만 바꿉니다.
  const updateMessage = (key: number, update: (message: ChatMessage) => ChatMessage) => {
    setMessages((current) => current.map((message) => (message.key === key ? update(message) : message)))
  }

  // 46번: 새로고침 전에 만들던 답변을 2초마다 확인해서 끝나면 보여줍니다.
  async function followUnfinishedAnswer(key: number, messageId: number, isStopped: () => boolean) {
    setIsAnswering(true)
    answeringMessageId.current = messageId

    try {
      while (!isStopped()) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        if (isStopped()) return

        const message = await getMessage(roomId, messageId)
        updateMessage(key, (current) => ({ ...current, status: message.status, text: message.content ?? '', citations: message.citations ?? [] }))
        if (!isInProgress(message.status)) break
      }
    } catch {
      updateMessage(key, (current) => ({ ...current, status: 'failed' }))
    } finally {
      if (!isStopped()) {
        answeringMessageId.current = null
        setIsAnswering(false)
      }
    }
  }

  // 45번 질문 보내기와 48번 다시 생성에서 같이 쓰는 답변 받기
  const receiveAnswer = async (key: number, start: (handlers: QuestionStreamHandlers, signal: AbortSignal) => Promise<void>) => {
    setIsAnswering(true)

    const controller = new AbortController()
    answerController.current = controller

    try {
      await start({
        onCreated: (messageId) => {
          answeringMessageId.current = messageId
          updateMessage(key, (message) => ({ ...message, messageId, status: 'streaming' }))
        },
        onToken: (text) => updateMessage(key, (message) => ({ ...message, text: message.text + text })),
        onCitation: (citation) => updateMessage(key, (message) => ({ ...message, citations: [...message.citations, citation] })),
        onDone: () => {
          updateMessage(key, (message) => ({ ...message, status: 'completed' }))
          // 첫 질문이 끝나면 서버가 대화 이름을 자동으로 바꾸므로 사이드바를 다시 불러옵니다.
          onRoomTitleChange()
        },
      }, controller.signal)

      // done 없이 연결이 끝났으면(서버에서 중지 등) 다시 생성할 수 있게 표시합니다.
      updateMessage(key, (message) => (isInProgress(message.status) ? { ...message, status: 'failed' } : message))
    } catch (error) {
      if (controller.signal.aborted) return

      const errorText = error instanceof Error ? error.message : '답변을 받지 못했습니다.'
      updateMessage(key, (message) => ({ ...message, status: 'failed', text: message.text ? `${message.text}\n\n(${errorText})` : errorText }))
    } finally {
      if (answerController.current === controller) {
        answerController.current = null
        answeringMessageId.current = null
        setIsAnswering(false)
      }
    }
  }

  const askQuestion = (question: string, fromSuggestion: boolean) => {
    isNearBottom.current = true // 내가 질문을 보내면 항상 맨 아래로 이동
    if (isAnswering) return

    const answer = createMessage({ messageId: null, role: 'ai', status: 'pending', text: '', citations: [] })
    setMessages((current) => [
      ...current,
      createMessage({ messageId: null, role: 'user', status: 'completed', text: question, citations: [], fromSuggestion }),
      answer,
    ])

    receiveAnswer(answer.key, (handlers, signal) => sendQuestion(roomId, question, handlers, signal))
  }

  // 48번 다시 생성
  const retryMessage = (message: ChatMessage) => {
    if (isAnswering || message.messageId === null) return

    const messageId = message.messageId
    updateMessage(message.key, (current) => ({ ...current, status: 'pending', text: '', citations: [] }))
    receiveAnswer(message.key, (handlers, signal) => retryAnswer(roomId, messageId, handlers, signal))
  }

  // 47번 답변 중지: 지금까지 나온 답변은 그대로 남깁니다.
  const stopAnswer = async () => {
    const messageId = answeringMessageId.current
    const controller = answerController.current
    const answering = messages.find((message) => message.role === 'ai' && isInProgress(message.status))

    if (messageId !== null) {
      try {
        const result = await cancelAnswer(roomId, messageId)
        if (answering) updateMessage(answering.key, (message) => ({ ...message, status: 'canceled', text: result.content || message.text }))
      } catch {
        // 이미 답변이 끝났으면 중지할 게 없습니다.
      }
    }

    if (controller) {
      controller.abort()
      if (answering) updateMessage(answering.key, (message) => (isInProgress(message.status) ? { ...message, status: 'canceled' } : message))
      answerController.current = null
    }
    answeringMessageId.current = null
    setIsAnswering(false)
  }

  // 50번 추천 질문 새로 받기
  const refreshSuggestions = async () => {
    setIsRefreshingSuggestions(true)
    try {
      const result = await refreshSuggestedQuestions(roomId)
      setSuggestedQuestions(result.map((item) => item.question))
    } catch (error) {
      alert(error instanceof Error ? error.message : '추천 질문을 새로 받지 못했습니다.')
    } finally {
      setIsRefreshingSuggestions(false)
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
    setSummaryPaper(paper)
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

  // 요약의 페이지 태그를 누르면 PDF에서 그 위치로 이동해요 (체크리스트 근거와 같은 방식)
  const showSummaryEvidence = async (citation: SummaryCitation) => {
    if (!summaryPaper || citation.pageNo === null) return

    let bbox = null
    if (citation.chunkId !== null) {
      bbox = (await getChunk(summaryPaper.userPaperId, citation.chunkId).catch(() => null))?.bbox ?? null
    }

    onShowPaperEvidence({ userPaperId: summaryPaper.userPaperId, pageNo: citation.pageNo, bbox })
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

  // 메시지가 추가되거나 답변이 이어서 나올 때, 맨 아래를 보고 있었다면 따라 내려가요
  useEffect(() => {
    const box = messagesRef.current
    if (box && isNearBottom.current) box.scrollTop = box.scrollHeight
  }, [messages, isSuggestionOpen])

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

      <div className="reader-chat-messages" ref={messagesRef} onScroll={handleMessagesScroll}>
        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.key} className={`reader-chat-bubble-user ${message.fromSuggestion ? 'reader-chat-bubble-user-suggested' : ''}`}>
              {message.text}
            </div>
          ) : (
            <div key={message.key} className="reader-chat-bubble-ai">
              <p className="reader-chat-bubble-ai-text">{message.text || (isInProgress(message.status) ? '답변을 만드는 중이에요...' : '')}</p>
              {message.status === 'canceled' && <p className="reader-chat-answer-note">답변을 중지했어요.</p>}
              {message.citations.map((citation) => {
                const key = `${message.key}-${citation.rank}`

                return (
                  <button key={key} className={`reader-chat-evidence-button ${activeEvidence === key ? 'reader-chat-evidence-button-active' : ''}`} type="button" onClick={() => showCitation(key, citation)}>
                    📄 논문에서 근거 확인{message.citations.length > 1 ? ` ${citation.rank}` : ''}
                  </button>
                )
              })}
              {(message.status === 'failed' || message.status === 'canceled') && message.messageId !== null && (
                <button className="reader-chat-evidence-button" type="button" disabled={isAnswering} onClick={() => retryMessage(message)}>
                  🔄 다시 생성
                </button>
              )}
            </div>
          )
        )}
      </div>

      {(messages.length === 0 || isSuggestionOpen) && suggestedQuestions.length > 0 && (
        <div className="reader-chat-suggestions">
          <div className="reader-chat-suggestions-header">
            <p className="reader-chat-suggestions-title">추천 질문</p>
            <button className="reader-chat-suggestions-refresh" type="button" disabled={isRefreshingSuggestions} onClick={refreshSuggestions}>
              {isRefreshingSuggestions ? '받는 중...' : '🔄 새로 받기'}
            </button>
          </div>
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

      {isSummaryOpen && <ReaderSummary summary={summary} message={summaryMessage} onShowEvidence={showSummaryEvidence} onClose={closeSummary} />}

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
        {isAnswering ? (
          <button className="reader-chat-send-button" type="button" aria-label="답변 중지" onClick={stopAnswer}>
            <span className="reader-chat-stop-icon" />
          </button>
        ) : (
          <button className="reader-chat-send-button" type="submit" aria-label="전송">
            <ArrowUpIcon />
          </button>
        )}
      </form>
    </section>
  )
}

export default ReaderChat
