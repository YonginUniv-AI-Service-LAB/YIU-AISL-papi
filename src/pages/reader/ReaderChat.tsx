import '../../styles/readerChat.css'

const toolButtons = ['추천 질문', '요약', '재현 가능성']

const suggestedQuestions = [
  '이 논문의 핵심 기여는 무엇인가요?',
  '어떤 모델을 사용했나요?',
  '실험 환경은 어떻게 되나요?',
  '이 논문의 한계점은 무엇인가요?',
]

function ReaderChat() {
  return (
    <section className="reader-chat">
      <div className="reader-chat-tools">
        {toolButtons.map((tool) => (
          <button key={tool} className="reader-chat-tool-button" type="button">{tool}</button>
        ))}
      </div>

      <div className="reader-chat-messages" />

      <div className="reader-chat-suggestions">
        <p className="reader-chat-suggestions-title">추천 질문</p>
        <div className="reader-chat-suggestions-list">
          {suggestedQuestions.map((question) => (
            <button key={question} className="reader-chat-suggestion" type="button">{question}</button>
          ))}
        </div>
      </div>

      <div className="reader-chat-input-box">
        <input className="reader-chat-input" type="text" placeholder="논문에 대해 질문해보세요." />
        <button className="reader-chat-send-button" type="button" aria-label="전송">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="19" x2="12" y2="5" />
            <polyline points="5 12 12 5 19 12" />
          </svg>
        </button>
      </div>
    </section>
  )
}

export default ReaderChat
