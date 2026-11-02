import { useEffect, useRef, useState } from 'react'
import { Button, Dropdown } from 'react-bootstrap'
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
        <Dropdown align="end" show={historyOpen} onToggle={next => setHistoryOpen(next)}>
          <Dropdown.Toggle type="button" size="sm" variant="outline-primary" aria-label="지난 질문 돌아보기">
            <i className="bi bi-clock-history me-1" aria-hidden="true" />돌아보기
          </Dropdown.Toggle>
          <Dropdown.Menu className="p-2" style={{ maxHeight: 'min(60vh, 28rem)', overflowY: 'auto', width: 'min(22rem, calc(100vw - 2rem))' }}>
            <p className="small text-secondary px-2 pt-1 mb-2">이 브라우저에 저장된 최근 질문이에요.</p>
            {previousQuestions.length === 0 ? <p className="small text-secondary px-2 mb-2">아직 저장된 질문이 없어요.</p> : (
              <div className="d-grid gap-2">
                {previousQuestions.map(item => (
                  <div key={item.id} className="surface p-2">
                    <p className="small mb-1 text-wrap">{item.question}</p>
                    <small className="text-secondary">{new Date(item.askedAt).toLocaleString('ko-KR')}</small>
                    <div className="mt-2"><Button type="button" size="sm" variant="outline-primary" onClick={() => { setText(item.question); setHistoryOpen(false) }}>질문 다시 쓰기</Button></div>
                  </div>
                ))}
              </div>
            )}
            {previousQuestions.length > 0 && onClearQuestionHistory && <>
              <Dropdown.Divider />
              <Button type="button" size="sm" variant="outline-secondary" className="w-100" onClick={onClearQuestionHistory}>기록 비우기</Button>
            </>}
          </Dropdown.Menu>
        </Dropdown>
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

    </section>
  )
}
