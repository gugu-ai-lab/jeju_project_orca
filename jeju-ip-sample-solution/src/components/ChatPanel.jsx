import { useEffect, useRef, useState } from 'react'
import ChatMessage from './ChatMessage'

// AI 관광 안내원 채팅 — 표현 전용. 데이터와 전송은 props 로만 다룬다.
//   messages   : ChatMessage 가 읽는 형태의 배열
//   loading    : 응답 대기 중
//   onSend     : (text) => void
//   suggestions: 빠른 질문 문자열 배열(선택)
//   notice     : 상단 안내 문구(선택, 예: 미리보기 안내)
export default function ChatPanel({ messages, loading, onSend, suggestions = [], notice, placeholder = '신화에 대해 물어보세요' }) {
  const [text, setText] = useState('')
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [messages, loading])

  const submit = (value) => {
    const v = value.trim()
    if (!v || loading) return
    onSend(v)
    setText('')
  }

  return (
    <section className="chat-panel surface" aria-label="AI 관광 안내원">
      <header className="chat-head">
        <span className="chat-avatar" aria-hidden="true"><i className="bi bi-moon-stars" /></span>
        <div>
          <h2 className="h6 mb-0">탐라 이야기 안내원</h2>
          {notice && <small className="text-secondary">{notice}</small>}
        </div>
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
            <button key={q} type="button" className="btn btn-outline-sea btn-sm" disabled={loading} onClick={() => submit(q)}>{q}</button>
          ))}
        </div>
      )}

      <form className="chat-input" onSubmit={(e) => { e.preventDefault(); submit(text) }}>
        <input
          className="form-control"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label="질문 입력"
          maxLength={300}
        />
        <button type="submit" className="btn btn-citrus" disabled={loading || !text.trim()}>
          <i className="bi bi-send me-1" />보내기
        </button>
      </form>
    </section>
  )
}
