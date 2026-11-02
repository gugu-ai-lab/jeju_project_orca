import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import MythCard from '../components/MythCard'
import StoryPanel from '../components/StoryPanel'
import { MYTH_SCENES, MYTH_SOURCE } from '../data/mythStories'

// Gemini 검증 완료 대표 신화·전설 7선 (학생 눈높이 질문형 카드 + 장면별 2~3문장 요약)
const STUDENT_MYTHS = [
  {
    id: 'seolmundae',
    title: '설문대할망',
    tag: '창세 신화',
    tone: 'sky',
    icon: 'water',
    place: '제주돌문화공원 · 영실기암',
    question: '한라산과 360개 오름을 치마폭으로 만든 거인이 있다고?',
    scenes: [
      {
        id: 'seolmundae-1',
        caption: '1장면 · 치마폭으로 빚은 제주도',
        image: MYTH_SCENES.seolmundae?.[0]?.image,
        studentLines: [
          '아주 먼 옛날, 구름 위까지 키가 닿는 거인 할머니 설문대할망이 살았어요.',
          '할망이 치마폭에 흙을 가득 담아 나르면서 터진 구멍으로 흙이 조금씩 쏟아져 수많은 오름이 되었답니다.',
          '마지막에 가장 크게 쌓아 올린 흙더미가 바로 제주도의 중심인 한라산이 되었어요.',
        ],
        termTip: '‘오름’은 제주도 곳곳에 솟아 있는 작고 둥근 화산 봉우리를 부르는 제주 말이에요.',
      },
      {
        id: 'seolmundae-2',
        caption: '2장면 · 오백장군과 커다란 가마솥',
        image: MYTH_SCENES.seolmundae?.[1]?.image,
        studentLines: [
          '설문대할망에게는 무려 오백 명이나 되는든든한 아들들이 있었어요.',
          '사냥을 나간 아들들을 위해 큰 가마솥에 죽을 끓이던 할망은 그만 발을 헛디뎌 솥에 빠지고 말았어요.',
          '돌아온 아들들은 어머니를 그리워하며 끝없이 울다가 한라산 영실의 기암괴석(오백장군 바위)으로 굳어졌답니다.',
        ],
        termTip: '원문 기록의 ‘초인담(超人譚)’은 사람보다 훨씬 큰 힘을 가진 거인이나 영웅 이야기를 뜻해요.',
      },
    ],
    placeBridge: {
      placeName: '한라산 영실기암 & 제주돌문화공원',
      summary: '오백장군 전설이 깃든 한라산 영실기암(명승)과 설문대할망 테마 전시관인 제주돌문화공원에서 이야기를 만날 수 있어요.',
    },
    source: MYTH_SOURCE,
  },
  {
    id: 'samsinin',
    title: '탐라 삼신인',
    tag: '개국 신화',
    tone: 'mint',
    icon: 'tree',
    place: '제주 삼성혈',
    question: '땅속 세 구멍에서 태어난 세 사람이 화살로 마을을 정했다고?',
    scenes: [
      {
        id: 'samsung-1',
        caption: '1장면 · 삼성혈에서 태어난 세 신인',
        image: MYTH_SCENES.samsinin?.[0]?.image,
        studentLines: [
          '옛날 제주의 숲속 땅에서 고을나, 양을나, 부을나라는 세 명의 신인(삼신인)이 동시에 솟아났어요.',
          '세 사람은 사냥을 하며 지내다가, 앞으로 각자 살아갈 마을 터전을 정하기로 약속했답니다.',
          '한라산 중턱에 올라가 힘껏 활을 쏘았고, 화살이 꽂힌 세 곳이 옛 제주(탐라) 마을의 시작이 되었어요.',
        ],
        termTip: '‘삼성혈(三姓穴)’은 세 성씨의 신인이 태어난 구멍이라는 뜻으로, 지금도 제주시 중심가에 보존되어 있어요.',
      },
      {
        id: 'samsung-2',
        caption: '2장면 · 바다 건너 찾아온 새로운 시작',
        image: MYTH_SCENES.samsinin?.[1]?.image,
        studentLines: [
          '어느 날 동쪽 바다에서 붉은 도장을 찍은 나무 상자가 파도를 타고 제주 해안으로 떠밀려 왔어요.',
          '상자를 열어 보니 푸른 옷을 입은 벽랑국의 세 공주님과 송아지, 망아지, 다섯 가지 곡식 씨앗이 들어 있었지요.',
          '이 만남을 계기로 사냥만 하던 제주에 처음으로 농사를 짓고 가축을 기르는 생활이 시작되었답니다.',
        ],
        termTip: '‘벽랑국(碧浪國)’은 푸른 물결 너머에 있다고 전해지는 신비로운 바다 건너 나라예요.',
      },
    ],
    placeBridge: {
      placeName: '제주 삼성혈 (제주시 삼성로 22)',
      summary: '삼신인이 솟아난 세 개의 구멍을 직접 볼 수 있는 국가지정 사적이에요. (한국관광공사 TourAPI·국가유산청 확인)',
    },
    source: MYTH_SOURCE,
  },
  {
    id: 'honinji',
    title: '혼인지',
    tag: '개국·혼례 신화',
    tone: 'sky',
    icon: 'stars',
    place: '성산 온평리 혼인지',
    question: '바다에서 나무 상자를 타고 온 세 공주님이 결혼식을 올린 연못은 어딜까?',
    scenes: [
      {
        id: 'honinji-1',
        caption: '1장면 · 온평리 바다에 도착한 나무 상자',
        studentLines: [
          '삼신인이 성산 온평리 바닷가(연혼포)에서 빛나는 나무 상자를 발견해 뭍으로 끌어올렸어요.',
          '상자 안에서 나온 벽랑국의 세 공주님은 제주에 농사를 지을 수 있는 오곡 씨앗을 선물로 가져왔답니다.',
        ],
        termTip: '공식 역사문화 자료(#2945)에 따르면 나무 상자가 처음 닿은 바닷가를 ‘연혼포’라고 불러요.',
      },
      {
        id: 'honinji-2',
        caption: '2장면 · 연못가에서 올린 첫 혼례',
        studentLines: [
          '삼신인과 세 공주님은 맑은 연못가에서 혼례(결혼식)를 올리고 연못 옆 동굴에서 신혼살림을 차렸어요.',
          '세 쌍의 부부가 탄생한 이 연못을 오늘날까지 ‘혼인지(婚姻池)’라고 부르며 소중히 지키고 있답니다.',
        ],
        termTip: '‘혼인지’는 결혼(혼인)을 올린 연못(지)이라는 뜻으로, 서귀포시 성산읍 온평리에 있어요.',
      },
    ],
    placeBridge: {
      placeName: '성산 온평리 혼인지 & 온평리 해안',
      summary: '삼신인과 세 공주가 결혼식을 올린 연못과 신방 동굴, 나무 상자가 도착한 온평리 바닷가를 함께 탐험할 수 있어요.',
    },
    source: {
      label: '제주역사문화일반·위치정보 #2945 및 제주신화정보 OpenAPI',
      url: 'https://www.data.go.kr/data/15058603/openapi.do',
      license: '공공데이터 출처 확인',
    },
  },
  {
    id: 'jacheongbi',
    title: '자청비',
    tag: '농경 신화',
    tone: 'mint',
    icon: 'flower1',
    place: '제주 전역 전승 신화',
    question: '하늘나라 시험을 통과해 제주에 다섯 가지 곡식 씨앗을 가져온 소녀는 누굴까?',
    scenes: [
      {
        id: 'jacheongbi-1',
        caption: '1장면 · 지혜롭고 용감한 소녀 자청비',
        studentLines: [
          '땅에 살던 소녀 자청비는 우연히 만난 하늘나라 청년 문도령과 마음을 나누게 되었어요.',
          '자청비는 문도령을 다시 만나기 위해 온갖 어려운 시험을 슬기롭게 이겨 내고 마침내 부부가 되었답니다.',
        ],
        termTip: '제주 무속 신화에서는 이야기를 노래로 풀어 들려주는 것을 ‘본풀이’라고 불러요.',
      },
      {
        id: 'jacheongbi-2',
        caption: '2장면 · 씨앗을 품고 내려온 농사의 여신',
        studentLines: [
          '자청비는 하늘나라에서 사람들이 먹고살 수 있는 소중한 다섯 가지 곡식(오곡) 씨앗을 받아 땅으로 내려왔어요.',
          '그 뒤로 제주 사람들은 자청비를 풍년을 지켜 주는 고마운 농사의 여신(세경신)으로 모시게 되었답니다.',
        ],
        termTip: '‘오곡(五穀)’은 쌀, 보리, 조, 콩, 기장처럼 우리가 매일 먹는 대표적인 다섯 가지 곡식을 말해요.',
      },
    ],
    placeBridge: {
      placeName: '제주 전역에 전해지는 농경 신화 (특정 단일 관광지 없음)',
      summary: '자청비 이야기는 특정 한 장소가 아니라 제주도 전체 마을에서 풍년을 기원하며 전해 내려오는 소중한 신화예요.',
      hasPlace: false,
    },
    source: MYTH_SOURCE,
  },
  {
    id: 'suwolbong',
    title: '수월봉과 녹고물',
    tag: '지명·효행 전설',
    tone: 'sky',
    icon: 'droplet',
    place: '한경면 고산리 수월봉',
    question: '어머니 약초를 캐러 간 누나를 그리워한 동생의 눈물이 샘물이 되었다고?',
    scenes: [
      {
        id: 'suwolbong-1',
        caption: '1장면 · 절벽에서 약초를 찾던 수월이와 녹고',
        studentLines: [
          '어머니의 병을 고치기 위해 누나 수월이와 남동생 녹고는 백 가지 약초를 구하러 바닷가 절벽까지 찾아갔어요.',
          '마지막 약초인 오갈피를 발견한 누나 수월이가 가파른 절벽 아래로 내려갔다가 그만 떨어지고 말았답니다.',
        ],
        termTip: '수월봉 해안 절벽은 화산재가 겹겹이 쌓여 만들어진 세계적인 지질 명소(천연기념물)이기도 해요.',
      },
      {
        id: 'suwolbong-2',
        caption: '2장면 · 절벽에서 흐르는 녹고의 눈물 샘',
        studentLines: [
          '홀로 남은 동생 녹고는 누나를 부르며 열흘 밤낮으로 슬프게 울었고, 그 눈물이 절벽 바위틈에서 솟아나는 맑은 샘물이 되었어요.',
          '사람들은 남매의 효심을 기억하며 이 봉우리를 ‘수월봉’, 절벽의 샘물을 ‘녹고물’이라고 부르게 되었답니다.',
        ],
        termTip: '고산 해안산책로(엉알길)를 따라 걸으면 실제로 절벽에서 흐르는 ‘녹고물’ 약수터를 만날 수 있어요.',
      },
    ],
    placeBridge: {
      placeName: '한경면 수월봉 & 고산해안산책로(녹고물)',
      summary: '해안 절벽 산책로를 따라 걸으며 실제 녹고의 눈물 샘물과 멋진 바다 노을을 함께 관찰할 수 있어요. (역사문화 #2872)',
    },
    source: MYTH_SOURCE,
  },
  {
    id: 'sanbangdeok',
    title: '산방덕이',
    tag: '지명·여신 전설',
    tone: 'mint',
    icon: 'mountains',
    place: '안덕면 산방산 · 산방굴사',
    question: '산방산 동굴에서 태어난 여신이 그리움 끝에 바위가 된 사연은?',
    scenes: [
      {
        id: 'sanbangdeok-1',
        caption: '1장면 · 산방산의 정기를 받고 태어난 여신',
        studentLines: [
          '서귀포 안덕면의 우뚝 솟은 산방산 바위 동굴에서 아름답고 지혜로운 여신 산방덕이가 태어났어요.',
          '인간 세상으로 내려온 산방덕이는 성실한 청년 고씨와 결혼해 부지런히 일하며 행복하게 살았답니다.',
        ],
        termTip: '‘산방(山房)’은 산속에 방처럼 뚫린 굴이 있다는 뜻으로, 산방산 중턱에 자연 동굴인 산방굴사가 있어요.',
      },
      {
        id: 'sanbangdeok-2',
        caption: '2장면 · 바위와 약수로 남은 그리움',
        studentLines: [
          '하지만 욕심 많은 관리가 억울한 누명을 씌워 남편 고씨를 멀리 귀양 보내고 말았어요.',
          '남편을 간절히 그리워하던 산방덕이는 다시 산방산 동굴로 들어가 바위로 변했고, 천장에서 떨어지는 물방울은 그녀의 눈물이라고 전해져요.',
        ],
        termTip: '산방산은 국가지정 명승으로, 바로 앞 용머리해안과 함께 제주 남서부의 대표적인 지질 탐험지예요.',
      },
    ],
    placeBridge: {
      placeName: '서귀포 안덕면 산방산 & 산방굴사',
      summary: '산방산 중턱의 산방굴사에 올라가 동굴 천장에서 똑똑 떨어지는 약수와 사계 바다 풍경을 볼 수 있어요. (국가유산청 명승)',
    },
    source: MYTH_SOURCE,
  },
  {
    id: 'yeongdeung',
    title: '영등할망',
    tag: '바다·해녀 신화',
    tone: 'sky',
    icon: 'wind',
    place: '제주시 칠머리당 · 구좌 하도리',
    question: '매년 봄바람을 타고 찾아와 제주 바다에 미역과 전복 씨앗을 뿌려주는 할머니는?',
    scenes: [
      {
        id: 'yeongdeung-1',
        caption: '1장면 · 바다에 풍요를 선물하는 봄바람 여신',
        studentLines: [
          '해마다 음력 2월이 되면 바람의 여신 영등할망이 제주 바다를 찾아와 보름 동안 머물다 가요.',
          '할망이 제주 바닷가를 돌며 미역, 소라, 전복의 씨앗을 골고루 뿌려 주어야 한 해 동안 바다 수확이 풍성해진답니다.',
        ],
        termTip: '음력 2월 영등할망이 찾아올 때 부는 변덕스러운 봄바람을 제주에서는 ‘영등바람’이라고 불러요.',
      },
      {
        id: 'yeongdeung-2',
        caption: '2장면 · 어부들을 구하고 맞이하는 영등굿',
        studentLines: [
          '옛날에는 풍랑을 만나 외눈박이 거인의 섬에 떠밀려 간 제주 어부들을 영등할망이 무사히 구해 주기도 했어요.',
          '그래서 제주 해녀와 어부들은 칠머리당과 바닷가 당에 모여 안전한 바다와 풍어를 비는 ‘영등굿’을 열었답니다.',
        ],
        termTip: '‘제주칠머리당영등굿’은 국가무형유산이자 유네스코 인류무형문화유산으로 등재된 자랑스러운 전통문화예요.',
      },
    ],
    placeBridge: {
      placeName: '제주시 건입동 칠머리당 & 구좌 하도리 각시당',
      summary: '영등할망에게 바다의 평안을 빌고 짚배를 띄워 보내는 영등굿 유적지를 탐험할 수 있어요. (역사문화 #1635, #876)',
    },
    source: MYTH_SOURCE,
  },
]

export default function Home() {
  const [selectedId, setSelectedId] = useState(STUDENT_MYTHS[0].id)
  const [sceneIndex, setSceneIndex] = useState(0)
  const selected = STUDENT_MYTHS.find((m) => m.id === selectedId) || STUDENT_MYTHS[0]

  function handleSelectMyth(id) {
    setSelectedId(id)
    setSceneIndex(0)
  }

  return (
    <div className="student-home">
      {/* 1. 메인 히어로: 제목 한 줄 + 소개 한 문장만 깔끔하게 표시 */}
      <section className="myth-hero text-center" aria-label="제주 신화 탐험 소개">
        <span className="hero-cute-badge">🧭 제주 신화·전설 탐험대</span>
        <h1 className="myth-hero-title mt-2 mb-2">
          제주 섬에 숨겨진 신화 조각을 찾아 떠나요!
        </h1>
        <p className="myth-hero-sub mb-3">
          궁금한 신화 카드를 골라 이야기를 읽고, 이야기가 살아 숨 쉬는 진짜 제주 장소를 탐험해 보세요.
        </p>
        <div className="d-flex justify-content-center flex-wrap gap-2">
          <Link to="/explore" className="btn btn-primary btn-round">
            <i className="bi bi-compass me-1" />이야기 도감 열기
          </Link>
          <Link to="/agent" className="btn btn-outline-sea btn-round">
            <i className="bi bi-chat-dots me-1" />AI 안내원에게 물어보기
          </Link>
        </div>
      </section>

      {/* 2. 호기심 질문 카드 목록 (신화 제목 + 호기심 질문 + 파스텔 삽화만 간결하게) */}
      <section aria-labelledby="myth-select" className="mt-4 pt-2">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <h2 id="myth-select" className="section-cute-title mb-0">
            ✨ 어떤 이야기가 가장 궁금한가요?
          </h2>
          <span className="story-count-pill">검증된 대표 이야기 {STUDENT_MYTHS.length}선</span>
        </div>

        <Row className="g-3">
          {STUDENT_MYTHS.map((m) => (
            <Col key={m.id} xs={12} sm={6} lg={3}>
              <MythCard
                myth={m}
                selected={m.id === selectedId}
                onSelect={handleSelectMyth}
              />
            </Col>
          ))}
        </Row>
      </section>

      {/* 3. 장면별 2~3문장 이야기 그림책 & 진짜 장소 연결 */}
      <section className="mt-4 pt-2" aria-live="polite" aria-label="선택한 이야기">
        <StoryPanel
          storyId={selected.id}
          title={selected.title}
          question={selected.question}
          scene={selected.scenes?.[sceneIndex]}
          source={selected.source}
          sceneIndex={sceneIndex}
          sceneCount={selected.scenes?.length ?? 1}
          onSceneChange={setSceneIndex}
          placeBridge={selected.placeBridge}
          preferPastelArt
        />
      </section>
    </div>
  )
}
