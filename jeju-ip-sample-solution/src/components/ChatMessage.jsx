import ToolCallSteps from './ToolCallSteps'

// 대화 말풍선 — message: { role: 'user'|'assistant', text?, steps?, error?, preview? }
export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  return (
    <div className={`chat-msg ${isUser ? 'is-user' : 'is-assistant'}${message.error ? ' is-error' : ''}`}>
      {!isUser && <span className="chat-avatar" aria-hidden="true"><i className="bi bi-moon-stars" /></span>}
      <div className="chat-bubble">
        {message.preview && <span className="preview-badge mb-1">예시 응답 · 실제 안내원 아님</span>}
        {!isUser && <ToolCallSteps steps={message.steps} />}
        {message.text && <p className="mb-0">{message.text}</p>}
      </div>
    </div>
  )
}
