import { FavoritesError } from './supabase-session.js'
// 화면의 기존 관광 카드와 이야기 카드 입력을 동일한 검증 서비스로 전달한다.
export function favoriteInput(input) {
  if (input?.storyId) return { storyId: input.storyId, storyTitle: input.storyTitle }
  if (!['tour', 'heritage'].includes(input?.source) || input.id == null || String(input.id).trim() === '') throw new Error('INVALID_FAVORITE')
  return { storyId: `${input.source}:${String(input.id).trim()}`, storyTitle: input.title }
}
export function createFavoritesSlice(set, get, service) {
  const failure = error => set({ favError: error instanceof FavoritesError ? error.message : '즐겨찾기 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.' })
  return {
    favorites: [], favLoading: false, favError: null,
    loadFavorites: async () => {
      if (get().favLoading) return false
      set({ favLoading: true, favError: null })
      try { set({ favorites: await service.list() }); return true }
      catch (error) { failure(error); return false }
      finally { set({ favLoading: false }) }
    },
    addFavorite: async input => {
      if (get().favLoading) return false
      set({ favLoading: true, favError: null })
      try {
        const { favorite, created } = await service.save(favoriteInput(input))
        set({ favorites: [favorite, ...get().favorites.filter(f => f.storyId !== favorite.storyId)] })
        get().toast(created ? '즐겨찾기에 저장했어요' : '이미 저장한 즐겨찾기예요')
        return true
      } catch (error) { failure(error); return false }
      finally { set({ favLoading: false }) }
    },
    removeFavorite: async storyId => {
      if (get().favLoading) return false
      set({ favLoading: true, favError: null })
      try {
        await service.remove(storyId)
        set({ favorites: get().favorites.filter(f => f.storyId !== storyId) })
        return true
      } catch (error) { failure(error); return false }
      finally { set({ favLoading: false }) }
    },
  }
}
