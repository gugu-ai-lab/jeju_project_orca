import { useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { Html, OrbitControls } from '@react-three/drei'

// WebGL 지원 여부 확인 (미지원 브라우저/환경 대비)
function isWebGLSupported() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') ||
          canvas.getContext('webgl') ||
          canvas.getContext('experimental-webgl'))
    )
  } catch {
    return false
  }
}

// SVG 좌표(800×480) → 3D 미니어처 섬 위 좌표(X, Z)로 변환
function svgTo3DCoords(svgX, svgY) {
  const x = ((svgX - 400) / 400) * 5.0
  const z = ((svgY - 240) / 240) * 3.0
  return [x, z]
}

// 제주 본섬 윤곽선을 3D 미니어처 판(ExtrudeGeometry)으로 생성
function JejuIslandMesh() {
  const { baseGeo, meadowGeo, forestGeo } = useMemo(() => {
    // 실제 제주 지형 비율을 반영한 귀여운 곡선 Shape
    const points = [
      [-3.55, -0.32],
      [-3.1, 0.45],
      [-2.25, 1.06],
      [-1.05, 1.52],
      [0.3, 1.8],
      [1.6, 1.7],
      [3.02, 1.45],
      [3.82, 0.65],
      [3.62, 0.1],
      [3.0, -0.58],
      [1.68, -1.2],
      [-0.05, -1.5],
      [-1.68, -1.48],
      [-2.78, -1.52],
      [-3.3, -0.82],
    ]

    const shape = new THREE.Shape()
    shape.moveTo(points[0][0], points[0][1])
    for (let i = 0; i < points.length; i++) {
      const curr = points[i]
      const next = points[(i + 1) % points.length]
      const midX = (curr[0] + next[0]) / 2
      const midY = (curr[1] + next[1]) / 2
      shape.quadraticCurveTo(curr[0], curr[1], midX, midY)
    }
    shape.closePath()

    // 1층: 아이보리 모래·해안 단차
    const base = new THREE.ExtrudeGeometry(shape, {
      depth: 0.24,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.1,
      bevelSegments: 3,
      curveSegments: 24,
    })

    // 2층: 파스텔 민트 들판
    const meadow = new THREE.ExtrudeGeometry(shape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 2,
      curveSegments: 24,
    })

    // 3층: 중산간 곶자왈 타원형 대지
    const forestShape = new THREE.Shape()
    forestShape.absellipse(0.08, 0.06, 2.25, 0.98, 0, Math.PI * 2, false, 0)
    const forest = new THREE.ExtrudeGeometry(forestShape, {
      depth: 0.14,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.06,
      bevelSegments: 2,
      curveSegments: 24,
    })

    return { baseGeo: base, meadowGeo: meadow, forestGeo: forest }
  }, [])

  return (
    <group>
      {/* 1층 아이보리 해안 받침 */}
      <mesh geometry={baseGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]}>
        <meshToonMaterial color="#FFFDF7" />
      </mesh>

      {/* 2층 파스텔 민트 대지 */}
      <mesh
        geometry={meadowGeo}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.16, 0]}
        scale={[0.96, 0.96, 1]}
      >
        <meshToonMaterial color="#E2F4F0" />
      </mesh>

      {/* 3층 중산간 파스텔 곶자왈 */}
      <mesh geometry={forestGeo} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.28, 0]}>
        <meshToonMaterial color="#C8E8E1" />
      </mesh>

      {/* 중앙 한라산 & 백록담 미니어처 */}
      <group position={[0.02, 0.42, -0.14]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.45, 1.15, 0.52, 24]} />
          <meshToonMaterial color="#4FA3B7" />
        </mesh>
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.28, 0.62, 0.36, 24]} />
          <meshToonMaterial color="#2F5D50" />
        </mesh>
        {/* 백록담 분화구 테두리 & 호수 */}
        <mesh position={[0, 0.71, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.06, 20]} />
          <meshToonMaterial color="#FFFDF7" />
        </mesh>
        <mesh position={[0, 0.75, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.03, 20]} />
          <meshToonMaterial color="#A9D7F3" />
        </mesh>
      </group>

      {/* 귀여운 동부·서부 오름 미니어처 */}
      <mesh position={[1.75, 0.48, -0.35]}>
        <coneGeometry args={[0.28, 0.32, 16]} />
        <meshToonMaterial color="#4FA3B7" />
      </mesh>
      <mesh position={[1.42, 0.45, -0.22]}>
        <coneGeometry args={[0.22, 0.25, 16]} />
        <meshToonMaterial color="#A9D7F3" />
      </mesh>
      <mesh position={[-1.65, 0.45, -0.12]}>
        <coneGeometry args={[0.24, 0.28, 16]} />
        <meshToonMaterial color="#4FA3B7" />
      </mesh>

      {/* 남서쪽 안덕 산방산 돔 미니어처 */}
      <mesh position={[-1.95, 0.42, 0.96]}>
        <sphereGeometry args={[0.26, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshToonMaterial color="#2F5D50" />
      </mesh>

      {/* 동쪽 끝 성산일출봉 왕관 미니어처 */}
      <mesh position={[3.45, 0.42, -0.32]}>
        <cylinderGeometry args={[0.22, 0.28, 0.24, 12]} />
        <meshToonMaterial color="#4FA3B7" />
      </mesh>

      {/* 부속 섬: 우도 · 차귀도 · 비양도 · 가파도 · 마라도 */}
      <mesh position={[4.1, 0.05, -0.82]} scale={[1.1, 0.4, 1.4]}>
        <cylinderGeometry args={[0.24, 0.28, 0.35, 16]} />
        <meshToonMaterial color="#FFFDF7" />
      </mesh>
      <mesh position={[-3.95, 0.04, 0.35]} scale={[1, 0.4, 1]}>
        <cylinderGeometry args={[0.16, 0.2, 0.3, 14]} />
        <meshToonMaterial color="#FFFDF7" />
      </mesh>
      <mesh position={[-2.95, 0.04, -0.78]} scale={[1, 0.4, 1]}>
        <cylinderGeometry args={[0.15, 0.18, 0.3, 14]} />
        <meshToonMaterial color="#FFFDF7" />
      </mesh>
      <mesh position={[-2.4, 0.03, 1.78]} scale={[1.2, 0.3, 0.8]}>
        <cylinderGeometry args={[0.16, 0.18, 0.28, 14]} />
        <meshToonMaterial color="#FFFDF7" />
      </mesh>
    </group>
  )
}

// 3D 섬 위에 세워진 신화 장소 핀 + HTML 클릭 버튼
function MiniaturePin({ pin, isSelected, onSelect }) {
  const [x, z] = svgTo3DCoords(
    pin.illustrationCoords.svgX,
    pin.illustrationCoords.svgY
  )
  // 한라산 중앙(설문대할망) 핀은 산 높이에 맞춰 살짝 높게 배치
  const baseY = pin.mythId === 'seolmundae' ? 0.72 : 0.42

  return (
    <group position={[x, baseY, z]}>
      {/* 바닥 원형 받침 */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.12, 0.22, 20]} />
        <meshBasicMaterial color={isSelected ? '#2F5D50' : '#4FA3B7'} />
      </mesh>

      {/* 귀여운 핀 기둥 & 구슬 */}
      <mesh
        position={[0, 0.22, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(pin)
        }}
      >
        <cylinderGeometry args={[0.04, 0.04, 0.38, 12]} />
        <meshToonMaterial color={isSelected ? '#2F5D50' : '#4FA3B7'} />
      </mesh>
      <mesh
        position={[0, 0.44, 0]}
        scale={isSelected ? 1.25 : 1}
        onClick={(e) => {
          e.stopPropagation()
          onSelect(pin)
        }}
      >
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshToonMaterial color={isSelected ? '#2F5D50' : '#A9D7F3'} />
      </mesh>

      {/* 기존 2.5D 지도와 동일한 스타일의 클릭 가능한 HTML 말풍선 */}
      <Html position={[0, 0.68, 0]} center zIndexRange={[10, 0]}>
        <button
          type="button"
          className={`mini3d-pin-btn ${isSelected ? 'is-selected' : ''}`}
          onClick={() => onSelect(pin)}
          aria-pressed={isSelected}
        >
          <span className="mini3d-pin-bubble">
            <span>{pin.emoji}</span>
            <span>{pin.mythTitle}</span>
          </span>
          <span className="mini3d-pin-sub">{pin.placeName}</span>
        </button>
      </Html>
    </group>
  )
}

export default function JejuMiniature3D({
  pins = [],
  selectedPin,
  onSelectPin,
  onFallbackToSvg,
}) {
  const webglAvailable = useMemo(() => isWebGLSupported(), [])

  if (!webglAvailable) {
    return (
      <div className="mini3d-fallback-box" role="status">
        <strong>💡 3D 화면 지원 안내</strong>
        <p className="mb-2">
          현재 브라우저 환경에서 WebGL 3D 가속이 비활성화되어 있어요. 기본 2.5D 그림책 지도에서 모든 신화 탐험을 동일하게 즐길 수 있습니다!
        </p>
        {onFallbackToSvg && (
          <button
            type="button"
            className="btn btn-primary btn-sm btn-round"
            onClick={onFallbackToSvg}
          >
            🎨 2.5D 그림책 지도로 돌아가기
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="mini3d-stage-wrap">
      <div className="mini3d-guide-pill">
        🧊 마우스나 손가락으로 제주 미니어처 섬을 좌우로 살짝 돌려 보세요!
      </div>

      <Canvas
        camera={{ position: [0, 5.4, 6.2], fov: 38 }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '22.5rem' }}
      >
        <color attach="background" args={['#EDF6FC']} />
        <ambientLight intensity={1.15} />
        <directionalLight position={[6, 10, 6]} intensity={0.95} />
        <directionalLight position={[-5, 6, -4]} intensity={0.35} />

        {/* 파스텔 바다 원판 */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <circleGeometry args={[6.2, 48]} />
          <meshBasicMaterial color="#DCEFF9" />
        </mesh>

        {/* 제주 미니어처 섬 지형 */}
        <JejuIslandMesh />

        {/* JSON 기반 신화 장소 핀 6곳 */}
        {pins.map((pin) => (
          <MiniaturePin
            key={pin.pinId}
            pin={pin}
            isSelected={selectedPin?.pinId === pin.pinId}
            onSelect={onSelectPin}
          />
        ))}

        {/* 모바일 스크롤을 방해하지 않도록 줌(휠)은 끄고 부드러운 회전 각도만 허용 */}
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          rotateSpeed={0.55}
          minPolarAngle={Math.PI / 4.2}
          maxPolarAngle={Math.PI / 2.55}
          minAzimuthAngle={-Math.PI / 4.5}
          maxAzimuthAngle={Math.PI / 4.5}
        />
      </Canvas>
    </div>
  )
}
