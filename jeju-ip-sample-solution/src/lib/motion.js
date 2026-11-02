// 움직임 설정 — 시스템의 "동작 줄이기"는 기본적으로 존중하되, 사용자가 사이트 안에서 직접 켤 수 있게 한다.
// 켜면 <html class="allow-motion"> 이 되고, theme.css 의 "동작 줄이기" 규칙이 그 클래스가 있을 때는 적용되지 않는다.
const KEY = 'jeju-allow-motion'
export const MOTION_EVENT = 'jeju-motion-change' // 움직임 설정이 바뀌면 배경이 스크롤 연출을 다시 계산한다
export const systemReducesMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
export function readAllowMotion() { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
export function applyAllowMotion(on) {
  document.documentElement.classList.toggle('allow-motion', on)
  window.dispatchEvent(new Event(MOTION_EVENT))
  try { localStorage.setItem(KEY, on ? '1' : '0') } catch { /* 저장 못 해도 이번 방문에는 적용된다 */ }
}
export function initMotion() { document.documentElement.classList.toggle('allow-motion', readAllowMotion()) }
