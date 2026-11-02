import { useState } from 'react'
import { applyAllowMotion, readAllowMotion, systemReducesMotion } from '../lib/motion'

// 시스템이 동작 줄이기일 때만 보인다. 배경·장면 움직임을 직접 켜고 끌 수 있다.
export default function MotionToggle({ className = '' }) {
  const [on, setOn] = useState(readAllowMotion)
  if (!systemReducesMotion()) return null
  const toggle = () => { const next = !on; setOn(next); applyAllowMotion(next) }
  return (
    <button type="button" className={`motion-toggle ${className}`} aria-pressed={on} onClick={toggle}
      title="기기의 '동작 줄이기' 설정으로 움직임이 멈춰 있어요. 이 사이트에서만 켤 수 있어요.">
      <i className={`bi bi-${on ? 'pause-circle' : 'play-circle'} me-1`} aria-hidden="true" />
      {on ? '배경 움직임 끄기' : '배경 움직임 켜기'}
    </button>
  )
}
