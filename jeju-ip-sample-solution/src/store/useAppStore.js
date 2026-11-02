import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { saveMythFavorite, listMythFavorites, deleteMythFavorite } from '../../services/browser-favorites'
import { createFavoritesSlice } from '../../services/favorites-presentation'
import { askAgent } from '../api/client'

// ── 앱 전체가 함께 쓰는 상태(store) ──────────────────────
// 여러 페이지에서 같이 쓰는 데이터는 여기에 둡니다. (한 페이지에서만 쓰면 useState)
// 사용법:  const nickname = useAppStore((s) => s.nickname)
export const useAppStore = create(
  persist(
    (set, get) => ({
      // ① 사용자 — localStorage 에 저장되어 새로고침해도 유지
      nickname: '',
      setNickname: (nickname) => set({ nickname: nickname.trim() }),

      // ② 알림(토스트) — 어느 페이지에서든 get().toast('메시지')
      toasts: [],
      toast: (message, variant = 'success') => {
        const id = Date.now() + Math.random()
        set({ toasts: [...get().toasts, { id, message, variant }] })
        setTimeout(() => set({ toasts: get().toasts.filter((t) => t.id !== id) }), 2500)
      },

      ...createFavoritesSlice(set, get, { save: saveMythFavorite, list: listMythFavorites, remove: deleteMythFavorite }),

      // ④ STEP 6: 에이전트 대화 — 페이지를 옮겨도 대화가 남도록 store 에 둡니다
      messages: [],          // { role: 'user' | 'assistant', text, steps }
      chatLoading: false,
      chatError: null,
      sendMessage: async (text) => {
        if (get().chatLoading) return false
        const history = get().messages.slice(-6).map((m) => ({ role: m.role, content: m.text.slice(0, 600) }))  // 제한된 화면 대화 기록
        set({ messages: [...get().messages, { role: 'user', text }], chatLoading: true, chatError: null })
        try {
          const { answer, steps } = await askAgent(text, history)
          set({ messages: [...get().messages, { role: 'assistant', text: answer, steps }] })
          return true
        } catch (e) {
          set({ chatError: { message: e.message, steps: e.steps || [] }, messages: get().messages.slice(0, -1) })
          return false
        } finally {
          set({ chatLoading: false })
        }
      },
    }),
    {
      name: 'jeju-ip-store',                          // localStorage 키 이름
      partialize: (s) => ({ nickname: s.nickname }),  // 저장할 항목만 고르기
    },
  ),
)
