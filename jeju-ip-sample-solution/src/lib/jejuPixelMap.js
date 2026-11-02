// 제주 도트 지도 — 지도 데이터(블록 높이·색·오브젝트)와 렌더러(three.js / 2D 캔버스 대체).
// 해안선·높이·오브젝트 위치는 "일러스트용 근사값"이며 측량 자료가 아니다.
// 핀은 jejuMapPins.json 의 실제 위경도(realGeoCoords)를 이 지도의 칸 좌표로 바꿔 놓는다(geoToMap).
// three 는 npm 패키지 대신 public/vendor/three/three.min.js 를 불러와 쓰므로 THREE 를 인자로 받는다.

const OUTLINE = [
  [126.55, 33.52], [126.64, 33.54], [126.76, 33.56], [126.86, 33.53], [126.93, 33.46], [126.90, 33.38],
  [126.83, 33.32], [126.71, 33.27], [126.56, 33.24], [126.41, 33.24], [126.30, 33.22], [126.22, 33.21],
  [126.16, 33.28], [126.16, 33.34], [126.25, 33.42], [126.31, 33.48], [126.45, 33.51],
]
// 부속 섬(우도·비양도·가파도): [경도, 위도, 가로 반지름, 세로 반지름]
const ISLETS = [[126.953, 33.503, .016, .018], [126.228, 33.394, .008, .008], [126.270, 33.170, .010, .008]]
// 바다를 섬 둘레로 넉넉히 깔아 어느 각도에서도 가장자리가 화면 안에 들어오지 않게 한다
const LON0 = 126.00, LON1 = 127.10, LAT0 = 33.04, LAT1 = 33.70
const CELL_DEG = .0075
const COLS = Math.round((LON1 - LON0) / CELL_DEG)
const ROWS = Math.round(COLS * ((LAT1 - LAT0) * 111) / ((LON1 - LON0) * 93))
const STEPS = 24
const SEA_RING = 12 // 이 거리(칸) 안쪽 바다에만 물결 반짝임을 넣는다
const SEA = [0xA6E3EA, 0x7CCBDD, 0x58B4CC]
const FOAM = 0xF4FDFF
const C = {
  sand: 0xF7E7A8, canola: 0xFFD84A, canola2: 0xFFE97A, field: 0xA6E070, field2: 0x92D45E, grass: 0x8FDB62, orchard: 0x9ADB66,
  forest: 0x2FA76B, rock: 0xC9BFAE, peak: 0xF4EFE0, lake: 0x5BC6E8,
}
const SPR = {
  pine: { pal: { g: '#2c9a5f', G: '#1d6e46', t: '#7a4a2a' }, rows: ['...g...', '..gg...', '..ggG..', '.gggG..', '..gggG.', '.ggggG.', 'gggggGG', '...t...'] },
  tree: { pal: { g: '#58c060', G: '#2f8f4a', t: '#7a4a2a' }, rows: ['.ggg.', 'ggggG', 'gggGG', '.GGG.', '..t..', '..t..'] },
  tang: { pal: { g: '#58c060', G: '#2f8f4a', o: '#F28C28', t: '#7a4a2a' }, rows: ['.ggg.', 'gogoG', 'gggGo', '.GoG.', '..t..'] },
  dol: { pal: { S: '#7d766b', L: '#c8c1b4', d: '#26231f' }, rows: ['.SSS.', 'SSSSS', '.LLL.', 'LdLdL', '.LLL.', '.LLL.', 'LLLLL', 'LLLLL'] },
  boat: { pal: { w: '#ffffff', h: '#e7a25b', H: '#b9743a', t: '#6b4a2a' }, rows: ['...w...', '..www..', '.wwwww.', '...t...', 'hhhhhhh', '.HHHHH.'] },
}
const BOATS = [{ x: -38, z: -24, sp: .9 }, { x: 40, z: 20, sp: -.7 }, { x: -20, z: 26, sp: .6 }]
const DOLHAREUBANG_AT = [[126.53, 33.495], [126.56, 33.255], [126.92, 33.455], [126.29, 33.385]]

const hash = (i, j, s = 0) => { let h = (i * 73856093) ^ (j * 19349663) ^ (s * 83492791); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) % 1000 / 1000 }
const hexs = n => '#' + n.toString(16).padStart(6, '0')

function inPoly(x, y) {
  let c = false
  for (let i = 0, j = OUTLINE.length - 1; i < OUTLINE.length; j = i++) {
    const [xi, yi] = OUTLINE[i], [xj, yj] = OUTLINE[j]
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c
  }
  return c
}
const inside = (x, y) => inPoly(x, y) || ISLETS.some(([a, b, rx, ry]) => ((x - a) / rx) ** 2 + ((y - b) / ry) ** 2 <= 1)

/** 지도 데이터 한 번만 만든다(칸, 오브젝트, 좌표 변환). */
export function buildJejuMapData() {
  const cellLon = i => LON0 + (i + .5) / COLS * (LON1 - LON0)
  const cellLat = j => LAT1 - (j + .5) / ROWS * (LAT1 - LAT0)
  const land = new Uint8Array(COLS * ROWS)
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) land[j * COLS + i] = inside(cellLon(i), cellLat(j)) ? 1 : 0

  const dist = new Float32Array(COLS * ROWS).fill(99)
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const me = land[j * COLS + i]
    let m = 99
    for (let dj = -SEA_RING; dj <= SEA_RING; dj++) for (let di = -SEA_RING; di <= SEA_RING; di++) {
      const a = i + di, b = j + dj
      if (a < 0 || b < 0 || a >= COLS || b >= ROWS) continue
      if (land[b * COLS + a] !== me) m = Math.min(m, Math.hypot(di, dj))
    }
    dist[j * COLS + i] = m
  }

  const bump = (i, j, lon, lat, r) => Math.max(0, 1 - Math.hypot((cellLon(i) - lon) * 93, (cellLat(j) - lat) * 111) / r)
  const elev = (i, j) => {
    const k = j * COLS + i
    if (!land[k]) return -1
    let h = Math.pow(bump(i, j, 126.533, 33.362, 15), 1.5)       // 한라산
    h = Math.max(h, bump(i, j, 126.94, 33.458, 1.6) * .3)         // 성산일출봉
    h = Math.max(h, bump(i, j, 126.31, 33.24, 1.4) * .45)         // 산방산
    h += Math.min(1, dist[k] / 5) * .06 + hash(i, j, 9) * .012
    return Math.min(1, h)
  }
  const colorFor = (i, j, h, k) => {
    const lon = cellLon(i), lat = cellLat(j)
    if (dist[k] <= 1.3 && h < .12) return C.sand
    if (h > .97) return C.lake
    if (h > .84) return C.peak
    if (h > .6) return C.rock
    if (h > .3) return C.forest
    if (h > .13) return C.grass
    if (lon > 126.70 && lat > 33.40) return (i % 2 === 0) ? C.canola : C.canola2   // 동쪽 유채 들판
    if (lat < 33.295 && lon < 126.75) return C.orchard                              // 남쪽 감귤 과수원
    return hash(i, j, 3) < .5 ? C.field : C.field2
  }

  const cells = []
  for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
    const k = j * COLS + i, h = elev(i, j)
    cells.push(h < 0 ? { i, j, k, sea: true, sd: dist[k] } : { i, j, k, h, col: colorFor(i, j, h, k), coast: dist[k] <= 1.3 && h < .12 })
  }

  const sprites = []
  for (const c of cells) {
    if (c.sea || c.coast || c.h > .97) continue
    const r = hash(c.i, c.j, 5), lon = cellLon(c.i), lat = cellLat(c.j)
    let t = null
    if (c.h > .3 && c.h <= .6) { if (r < .3) t = 'pine' }
    else if (c.h > .13 && c.h <= .3) { if (r < .08) t = 'tree'; else if (r < .12) t = 'pine' }
    else if (c.h <= .13) { if (lat < 33.295 && lon < 126.75) { if (r < .22) t = 'tang' } else if (r < .012) t = 'tree' }
    if (t) sprites.push({ t, i: c.i, j: c.j, h: c.h })
  }
  const toCell = (lon, lat) => [(lon - LON0) / (LON1 - LON0) * COLS, (LAT1 - lat) / (LAT1 - LAT0) * ROWS]
  for (const [lon, lat] of DOLHAREUBANG_AT) {
    const [fi, fj] = toCell(lon, lat), i = Math.floor(fi), j = Math.floor(fj)
    if (land[j * COLS + i]) sprites.push({ t: 'dol', i, j, h: Math.max(0, elev(i, j)) })
  }

  /** 위경도 → 지도 칸 좌표. 육지 밖이면 가장 가까운 육지 칸으로 옮긴다(핀이 바다에 뜨지 않게). */
  function geoToMap(lon, lat) {
    let [fi, fj] = toCell(lon, lat)
    let i = Math.floor(fi), j = Math.floor(fj)
    if (!land[j * COLS + i]) {
      let best = null
      for (let dj = -6; dj <= 6; dj++) for (let di = -6; di <= 6; di++) {
        const a = i + di, b = j + dj
        if (a < 0 || b < 0 || a >= COLS || b >= ROWS || !land[b * COLS + a]) continue
        const d = Math.hypot(di, dj)
        if (!best || d < best.d) best = { d, a, b }
      }
      if (best) { fi = best.a + .5; fj = best.b + .5; i = best.a; j = best.b }
    }
    return { x: fi - COLS / 2, z: fj - ROWS / 2, h: Math.max(0, elev(i, j)) }
  }

  return { COLS, ROWS, cells, sprites, geoToMap }
}

const eh = (h, hScale) => .5 + Math.round(h * STEPS) / STEPS * hScale
const seaTone = (c, f) => {
  if (c.sd <= 1.5) return ((c.i + c.j + f) % 3 === 0) ? SEA[0] : FOAM
  if (c.sd <= 3.2) return SEA[0]
  if (c.sd <= 6) return SEA[1]
  if (c.sd <= SEA_RING && (c.i * 3 + c.j * 5 + f) % 13 === 0) return SEA[1]
  return SEA[2]
}

function makeThree(THREE, { canvas, data, getSize, getView }) {
  const { COLS: W, ROWS: H, cells, sprites } = data
  const gl = new THREE.WebGLRenderer({ canvas, antialias: false })     // WebGL 을 못 만들면 예외 → 2D 대체
  const scene = new THREE.Scene(); scene.background = new THREE.Color(SEA[2])
  scene.add(new THREE.AmbientLight(0xffffff, .55))
  const sun = new THREE.DirectionalLight(0xffffff, .45); sun.position.set(-.5, 10, .8); scene.add(sun)
  const frustum = 50
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -900, 900)
  const mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial({ color: 0xffffff }), cells.length)
  scene.add(mesh)
  // 바다 칸 밖으로 이어지는 바다 판 — 칸 윗면과 같은 높이로 두어 가장자리 옆면이 보이지 않게 한다(겹침은 polygonOffset 으로 정리)
  const ocean = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400),
    new THREE.MeshLambertMaterial({ color: SEA[2], polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 2 }))
  ocean.rotation.x = -Math.PI / 2; ocean.position.y = .1; scene.add(ocean)

  const dm = new THREE.Object3D(), col = new THREE.Color(), seaIdx = []
  cells.forEach((c, n) => { if (c.sea) seaIdx.push(n); else mesh.setColorAt(n, col.setHex(c.col)) })

  const U = .45, texCache = {}
  const spriteFor = name => {
    const sp = SPR[name], w = sp.rows[0].length, h = sp.rows.length
    if (!texCache[name]) {
      const c = document.createElement('canvas'); c.width = w; c.height = h + 1
      const x = c.getContext('2d')
      x.fillStyle = 'rgba(20,60,50,.22)'; x.fillRect(1, h, w - 2, 1)
      sp.rows.forEach((r, y) => [...r].forEach((ch, xx) => { if (sp.pal[ch]) { x.fillStyle = sp.pal[ch]; x.fillRect(xx, y, 1, 1) } }))
      const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter
      texCache[name] = t
    }
    const o = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCache[name], transparent: true, alphaTest: .5 }))
    o.scale.set(w * U, (h + 1) * U, 1); o.userData.hh = (h + 1) * U
    return o
  }
  const spriteObjs = sprites.map(s => { const o = spriteFor(s.t); scene.add(o); return o })
  const boatObjs = BOATS.map(() => { const o = spriteFor('boat'); scene.add(o); return o })

  function rebuild() {
    const { hScale } = getView()
    cells.forEach((c, n) => {
      const ht = c.sea ? .4 : eh(c.h, hScale)
      dm.position.set(c.i - W / 2 + .5, ht / 2 - .3, c.j - H / 2 + .5); dm.scale.set(1, Math.max(.1, ht), 1); dm.updateMatrix()
      mesh.setMatrixAt(n, dm.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
    sprites.forEach((s, n) => spriteObjs[n].position.set(s.i - W / 2 + .5, eh(s.h, hScale) + spriteObjs[n].userData.hh / 2, s.j - H / 2 + .5))
  }
  rebuild()

  const cc = new THREE.Color(), v = new THREE.Vector3()
  let lastSea = -1
  return {
    name: 'three.js (WebGL)',
    rebuild,
    resize() {
      const [w, h] = getSize(), { px } = getView()
      gl.setPixelRatio(1); gl.setSize(Math.max(80, Math.floor(w / px)), Math.max(45, Math.floor(h / px)), false)
      const a = w / h
      cam.left = -frustum * a; cam.right = frustum * a; cam.top = frustum * 1.12; cam.bottom = -frustum * .88; cam.updateProjectionMatrix()
    },
    frame(t) {
      const { yaw, tilt, reduce } = getView()
      const sy = Math.sin(yaw), cy = Math.cos(yaw), sT = Math.sin(tilt), cT = Math.cos(tilt)
      cam.position.set(sy * cT * 300, sT * 300, cy * cT * 300); cam.up.set(-sT * sy, cT, -sT * cy); cam.lookAt(0, 0, 0)
      const f = reduce ? 0 : Math.floor(t / 400)
      if (f !== lastSea) {
        lastSea = f
        for (const n of seaIdx) mesh.setColorAt(n, cc.setHex(seaTone(cells[n], f)))
        mesh.instanceColor.needsUpdate = true
      }
      BOATS.forEach((b, n) => {
        const bx = b.x + Math.sin(t / 2500 * b.sp) * 6, bz = b.z + Math.cos(t / 3000 * b.sp) * 2, o = boatObjs[n]
        o.position.set(bx, .4 + o.userData.hh / 2 + (reduce ? 0 : Math.sin(t / 500 + bx) * .25), bz)
      })
      gl.render(scene, cam)
    },
    pin(x, y, z) { const [w, h] = getSize(); v.set(x, y, z).project(cam); return [(v.x + 1) / 2 * w, (1 - v.y) / 2 * h] },
    dispose() { gl.dispose() },
  }
}

function makeCanvas2D({ canvas, data, getSize, getView }) {
  const { COLS: W, ROWS: H, cells, sprites } = data
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas 2d unavailable')
  let sw = 0, sh = 0, scale = 1, last = null
  const shade = (n, f) => 'rgb(' + ((n >> 16 & 255) * f | 0) + ',' + ((n >> 8 & 255) * f | 0) + ',' + ((n & 255) * f | 0) + ')'
  const drawSprite = (name, bx, by, k) => {
    const s = SPR[name], w = s.rows[0].length, h = s.rows.length
    ctx.fillStyle = 'rgba(20,60,50,.22)'; ctx.fillRect(Math.round(bx - w * k / 2), Math.round(by), w * k, k)
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const ch = s.rows[y][x]
      if (ch === '.' || !s.pal[ch]) continue
      ctx.fillStyle = s.pal[ch]; ctx.fillRect(Math.round(bx - w * k / 2) + x * k, Math.round(by - h * k) + y * k, k, k)
    }
  }
  return {
    name: '2D 캔버스(대체)',
    rebuild() {},
    resize() {
      const [w, h] = getSize(), { px } = getView()
      sw = Math.max(80, Math.floor(w / px)); sh = Math.max(45, Math.floor(h / px)); canvas.width = sw; canvas.height = sh
      scale = sh / (2 * 50)
    },
    frame(t) {
      const { yaw, tilt, reduce, hScale } = getView()
      const cy = Math.cos(yaw), sy = Math.sin(yaw), ct = Math.cos(tilt), sT = Math.sin(tilt)
      const Rv = [cy, -sy], Uv = [-sT * sy, ct, -sT * cy], Cv = [sy * ct, cy * ct]
      const X = (x, z) => sw / 2 + (x * Rv[0] + z * Rv[1]) * scale
      const Y = (x, y, z) => sh / 2 - (x * Uv[0] + y * Uv[1] + z * Uv[2]) * scale + sh * 0.06
      last = { X, Y }
      const f = reduce ? 0 : Math.floor(t / 400), sk = Math.max(1, Math.round(scale / 2.8))
      ctx.fillStyle = hexs(SEA[2]); ctx.fillRect(0, 0, sw, sh)
      const quad = (pts, c) => {
        ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 1; ctx.beginPath()
        pts.forEach((q, n) => n ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1])); ctx.closePath(); ctx.fill(); ctx.stroke()
      }
      const top = (x, y, z, c) => quad([[X(x - .5, z - .5), Y(x - .5, y, z - .5)], [X(x + .5, z - .5), Y(x + .5, y, z - .5)], [X(x + .5, z + .5), Y(x + .5, y, z + .5)], [X(x - .5, z + .5), Y(x - .5, y, z + .5)]], c)
      for (const c of cells) {
        if (!c.sea || c.sd > SEA_RING) continue
        const tone = seaTone(c, f)
        if (tone !== SEA[2]) top(c.i - W / 2 + .5, .4, c.j - H / 2 + .5, hexs(tone))
      }
      const items = []
      for (const c of cells) if (!c.sea) items.push({ d: (c.i - W / 2) * Cv[0] + (c.j - H / 2) * Cv[1], c })
      for (const s of sprites) items.push({ d: (s.i - W / 2) * Cv[0] + (s.j - H / 2) * Cv[1] + .4, s })
      const bs = BOATS.map(b => ({ x: b.x + Math.sin(t / 2500 * b.sp) * 6, z: b.z + Math.cos(t / 3000 * b.sp) * 2 }))
      for (const b of bs) items.push({ d: b.x * Cv[0] + b.z * Cv[1], b })
      items.sort((a, b) => a.d - b.d)
      for (const it of items) {
        if (it.c) {
          const c = it.c, x = c.i - W / 2 + .5, z = c.j - H / 2 + .5, y = eh(c.h, hScale)
          const P = (dx, yy, dz) => [X(x + dx, z + dz), Y(x + dx, yy, z + dz)]
          for (const [nx, nz, fc] of [[0, 1, .86], [0, -1, .66], [1, 0, .76], [-1, 0, .76]]) {
            if (nx * Cv[0] + nz * Cv[1] <= 0) continue
            const a = nx ? [nx * .5, -.5] : [-.5, nz * .5], b = nx ? [nx * .5, .5] : [.5, nz * .5]
            quad([P(a[0], 0, a[1]), P(b[0], 0, b[1]), P(b[0], y, b[1]), P(a[0], y, a[1])], shade(c.col, fc))
          }
          top(x, y, z, hexs(c.col))
        } else if (it.s) {
          const s = it.s, x = s.i - W / 2 + .5, z = s.j - H / 2 + .5
          drawSprite(s.t, X(x, z), Y(x, eh(s.h, hScale), z), sk)
        } else {
          const b = it.b
          drawSprite('boat', X(b.x, b.z), Y(b.x, .4, b.z) + (reduce ? 0 : Math.sin(t / 500 + b.x)), sk)
        }
      }
    },
    pin(x, y, z) { const [w, h] = getSize(); return [last.X(x, z) / sw * w, last.Y(x, y, z) / sh * h] },
    dispose() {},
  }
}

/** three.js 로 그리고, WebGL 을 쓸 수 없으면 2D 캔버스로 같은 지도를 그린다. */
export function createJejuMapRenderer(THREE, opts) {
  if (THREE) {
    try { return makeThree(THREE, opts) } catch { /* WebGL 불가 → 아래 2D 대체 */ }
  }
  return makeCanvas2D(opts)
}

/** 핀 말풍선 위치용: 위경도에 해당하는 월드 좌표(칸 단위). */
export const pinWorld = (data, lon, lat, hScale) => {
  const p = data.geoToMap(lon, lat)
  return { x: p.x, y: eh(p.h, hScale) + 1, z: p.z }
}
