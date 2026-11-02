import { useEffect, useRef, useState } from 'react'
import { Button, Modal } from 'react-bootstrap'
import ChatMessage from './ChatMessage'

// AI 관광 안내원 채팅 — 표현 전용. 데이터와 전송은 props 로만 다룬다.
//   messages   : ChatMessage 가 읽는 형태의 배열
//   loading    : 응답 대기 중
//   onSend     : (text) => void
//   suggestions: 빠른 질문 문자열 배열(선택)
//   notice     : 상단 안내 문구(선택, 예: 미리보기 안내)
export default function ChatPanel({ messages, loading, onSend, suggestions = [], notice, disabled = false, placeholder = '신화에 대해 물어보세요', previousQuestions = [], onClearQuestionHistory }) {
  const [text, setText] = useState('')
  const [historyOpen, setHistoryOpen] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [messages, loading])

  const submit = (value) => {
    const v = value.trim()
    if (!v || loading || disabled) return
    onSend(v)
    setText('')
  }

  return (
    <section className="chat-panel surface" aria-label="신화안내원">
      <header className="chat-head">
        <span className="chat-avatar" aria-hidden="true"><i className="bi bi-moon-stars" /></span>
        <div className="flex-grow-1">
          <h2 className="h6 mb-0">신화안내원</h2>
          {notice && <small className="text-secondary">{notice}</small>}
        </div>
        <Button type="button" size="sm" variant="outline-primary" onClick={() => setHistoryOpen(true)} aria-label="지난 질문 돌아보기">
          <i className="bi bi-clock-history me-1" aria-hidden="true" />돌아보기
        </Button>
      </header>

      <div className="chat-log" role="log" aria-live="polite">
        {messages.length === 0 && <p className="chat-empty">아직 대화가 없습니다. 궁금한 이야기를 물어보세요.</p>}
        {messages.map((m, i) => <ChatMessage key={m.id ?? i} message={m} />)}
        {loading && (
          <div className="chat-msg is-assistant" aria-label="답변 작성 중">
            <span className="chat-avatar" aria-hidden="true"><i className="bi bi-moon-stars" /></span>
            <div className="chat-bubble chat-typing"><span /><span /><span /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {suggestions.length > 0 && (
        <div className="chat-suggest">
          {suggestions.map((q) => (
            <button key={q} type="button" className="btn btn-outline-sea btn-sm" disabled={loading || disabled} onClick={() => submit(q)}>{q}</button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); submit(text) }}>
        <input
          className="form-control"
          disabled={disabled || loading}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label="질문 입력"
          maxLength={300}
        />
        <button type="submit" className="btn btn-citrus" disabled={loading || disabled || !text.trim()}>
          <i className="bi bi-send me-1" />보내기
        </button>
      </form>

      <Modal show={historyOpen} onHide={() => setHistoryOpen(false)} centered scrollable aria-labelledby="chat-history-title">
        <Modal.Header closeButton>
          <Modal.Title id="chat-history-title">돌아보기</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small text-secondary">이 브라우저에 저장된 최근 질문이에요. 질문을 고르면 입력창에 담깁니다.</p>
          {previousQuestions.length === 0 ? <p className="text-secondary mb-0">아직 저장된 질문이 없어요.</p> : (
            <ul className="list-unstyled d-grid gap-2 mb-0">
              {previousQuestions.map(item => (
                <li key={item.id} className="surface p-3">
                  <p className="mb-1">{item.question}</p>
                  <small className="text-secondary">{new Date(item.askedAt).toLocaleString('ko-KR')}</small>
                  <div className="mt-2"><Button type="button" size="sm" variant="outline-primary" onClick={() => { setText(item.question); setHistoryOpen(false) }}>질문 다시 쓰기</Button></div>
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        {previousQuestions.length > 0 && onClearQuestionHistory && <Modal.Footer>
          <Button type="button" variant="outline-secondary" onClick={onClearQuestionHistory}>기록 비우기</Button>
        </Modal.Footer>}
      </Modal>
    </section>
  )
}
