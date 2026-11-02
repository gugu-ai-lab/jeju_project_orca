import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { addAskedQuestion, normalizeAskedQuestions } from '../lib/chatHistory'

// 질문 기록은 이 브라우저의 localStorage에만 저장한다. 서버와 Supabase에는 저장하지 않는다.
export const useChatHistoryStore = create(persist((set) => ({
  questions: [],
  remember: question => set(state => ({ questions: addAskedQuestion(state.questions, question) })),
  clear: () => set({ questions: [] }),
}), {
  name: 'jeju-agent-questions-v1',
  version: 1,
  partialize: state => ({ questions: state.questions }),
  merge: (persisted, current) => ({ ...current, questions: normalizeAskedQuestions(persisted?.questions) }),
}))
