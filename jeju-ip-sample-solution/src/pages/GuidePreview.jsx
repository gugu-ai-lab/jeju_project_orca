import { useState } from 'react'
import ChatPanel from '../components/ChatPanel'
import PageHeader from '../components/PageHeader'

// 채팅 UI 미리보기 — 실제 안내원(OpenAI)과 연결되지 않았다. 아래 응답은 모두 화면 확인용 예시다.
const DEMO_STEPS = [{ name: 'search_myths', args: { keyword: '(예시)' }, status: 'ok', count: 0 }]

export default function GuidePreview() {
  const [messages, setMessages] = useState([
    { id: 'w', role: 'assistant', preview: true, text: '미리보기입니다. 실제 안내원이 연결되면 이곳에서 신화에 대해 질문할 수 있습니다.', steps: DEMO_STEPS },
  ])
  const [loading, setLoading] = useState(false)

  const send = (text) => {
    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text }])
    setLoading(true)
    setTimeout(() => {
      setMessages((m) => [...m, { id: `a${Date.now()}`, role: 'assistant', preview: true, text: '예시 응답입니다. 이 화면은 아직 AI 안내원과 연결되지 않았습니다.', steps: DEMO_STEPS }])
      setLoading(false)
    }, 900)
  }

  return (
    <>
      <PageHeader title="AI 안내원 미리보기" subtitle="채팅과 도구 호출 표시 UI 확인용 화면 — 응답은 모두 예시입니다" />
      <div className="mx-auto" style={{ maxWidth: '40rem' }}>
        <ChatPanel
          messages={messages}
          loading={loading}
          onSend={send}
          suggestions={['설문대할망 이야기를 알려줘', '삼성혈은 어떤 곳이야?']}
          notice="미리보기 · 실제 AI와 연결되지 않음"
        />
      </div>
    </>
  )
}
