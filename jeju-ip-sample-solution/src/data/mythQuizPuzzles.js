import { MYTH_PIXEL_ART } from './mythPixelArt.js'

/**
 * 제주 신화 퀴즈 & 그림 퍼즐 데이터 (Gemini 공공데이터 검증 완료 기준)
 *
 * 설계 원칙:
 * 1. 각 문제(questionId)는 고유한 퍼즐 조각(pieceId, pieceIndex)과 1:1 고정 매핑된다.
 *    문제 순서가 바뀌거나 새로고침 후 저장 데이터를 불러와도 조각-정답 연결이 변하지 않는다.
 * 2. 이미 맞힌 문제를 다시 맞혀도 조각이 중복 지급되지 않으며, 다른 문제를 틀려도 이미 열린 조각은 닫히지 않는다.
 * 3. grid: { rows, cols, totalPieces } 구조로 설계하여 3조각(1x3)뿐 아니라 6조각(2x3), 9조각(3x3)으로 즉시 확장 가능하다.
 */
export const MYTH_QUIZ_PUZZLES = {
  seolmundae: {
    storyId: 'seolmundae',
    puzzleId: 'puzzle-seolmundae-3piece-v1',
    title: '설문대할망 신화 그림 퍼즐',
    subtitle: '이야기 속 3가지 퀴즈를 맞히고 가려진 설문대할망 픽셀 그림을 완성해 보세요!',
    grid: {
      rows: 1,
      cols: 3,
      totalPieces: 3,
    },
    artwork: {
      src: MYTH_PIXEL_ART.seolmundae.puzzleImage,
      alt: '설문대할망 2장면 픽셀 아트',
      width: MYTH_PIXEL_ART.seolmundae.width,
      height: MYTH_PIXEL_ART.seolmundae.height,
      caption: '설문대할망 · 2장면 픽셀 아트',
      description: '설문대할망 이야기의 두 번째 장면을 담은 2D 픽셀 아트예요.',
      source: null,
    },
    pieces: [
      {
        pieceId: 'seolmundae-piece-1',
        pieceIndex: 0,
        row: 0,
        col: 0,
        questionId: 'q-seolmundae-1',
        shortLabel: '첫 번째 조각',
        areaHint: '왼쪽 그림 조각',
      },
      {
        pieceId: 'seolmundae-piece-2',
        pieceIndex: 1,
        row: 0,
        col: 1,
        questionId: 'q-seolmundae-2',
        shortLabel: '두 번째 조각',
        areaHint: '가운데 그림 조각',
      },
      {
        pieceId: 'seolmundae-piece-3',
        pieceIndex: 2,
        row: 0,
        col: 2,
        questionId: 'q-seolmundae-3',
        shortLabel: '세 번째 조각',
        areaHint: '오른쪽 그림 조각',
      },
    ],
    questions: [
      {
        id: 'q-seolmundae-1',
        order: 1,
        pieceId: 'seolmundae-piece-1',
        pieceIndex: 0,
        prompt: '설문대할망이 제주도와 한라산, 수많은 오름을 만들 때 흙을 어디에 담아 날랐을까요?',
        options: [
          { id: 'opt-skirt', text: '커다란 치마폭' },
          { id: 'opt-cart', text: '무쇠로 만든 수레' },
          { id: 'opt-cloud', text: '구름으로 짠 보자기' },
        ],
        correctOptionId: 'opt-skirt',
        hint: '1장면을 떠올려 보세요! 할머니가 입으신 옷의 넓은 폭에 흙을 담아 나르다가 구멍 사이로 떨어진 흙이 오름이 되었어요.',
        explanation:
          '정답이에요! 설문대할망이 치마폭에 흙을 담아 나르면서 터진 구멍으로 새어 떨어진 흙이 오름이 되고, 마지막에 크게 쌓은 흙이 한라산이 되었답니다.',
        evidence: '공공데이터포털 신화전설_삽화_설명.csv (16_8_20160725-01: "설문대 할망은 치마 폭에 흙을 날라 제주도를 만든다.")',
      },
      {
        id: 'q-seolmundae-2',
        order: 2,
        pieceId: 'seolmundae-piece-2',
        pieceIndex: 1,
        prompt: '설문대할망이 커다란 가마솥에 죽을 끓여 먹이려 했던 아들들은 모두 몇 명이었을까요?',
        options: [
          { id: 'opt-3', text: '삼 형제 (3명)' },
          { id: 'opt-500', text: '오백장군 (500명)' },
          { id: 'opt-12', text: '열두 형제 (12명)' },
        ],
        correctOptionId: 'opt-500',
        hint: '2장면의 제목을 확인해 보세요! 한라산 영실기암의 바위가 된 아들들의 숫자는 백 단위로 아주 많아요.',
        explanation:
          '맞았어요! 500명의 아들(오백장군)에게 줄 죽을 큰 솥에 끓이다가 그만 솥에 빠졌고, 슬피 울던 아들들은 한라산 영실의 바위가 되었답니다.',
        evidence: '공공데이터포털 신화전설_삽화_설명.csv (16_8_20160725-02: "500명의 아들에게 죽을 주기 위해 큰솔에 죽을 끊인다.")',
      },
      {
        id: 'q-seolmundae-3',
        order: 3,
        pieceId: 'seolmundae-piece-3',
        pieceIndex: 2,
        prompt: '설문대할망처럼 보통 사람보다 훨씬 큰 몸집과 힘을 가진 거인 이야기를 전통 설화 분류에서 무엇이라 부를까요?',
        options: [
          { id: 'opt-choindam', text: '초인담 (超人譚)' },
          { id: 'opt-animal', text: '동물담 (動物譚)' },
          { id: 'opt-proverb', text: '속담 (俗譚)' },
        ],
        correctOptionId: 'opt-choindam',
        hint: '2장면의 ‘쉬운 용어 풀이’를 살펴보세요! 보통 사람(人)을 뛰어넘는(超) 거인이나 영웅 이야기라는 뜻의 단어예요.',
        explanation:
          '정답입니다! 공공데이터 원문 기록에서 설문대할망 설화는 신비한 이야기(신이담) 중에서도 거인의 활약을 다룬 ‘초인담(超人譚)’으로 분류돼요.',
        evidence: '공공데이터포털 신화전설_삽화_설명.csv (16_8_20160725-01·02: "신이담(神異譚) 중 초인담(超人譚)에 속하며, 제주 전역에 이야기가 전해진다.")',
      },
    ],
  },
}

function createThreePiecePuzzle({ storyId, title, questions }) {
  const pixelArt = MYTH_PIXEL_ART[storyId]
  const pieces = questions.map((question, index) => ({
    pieceId: `${storyId}-piece-${index + 1}`,
    pieceIndex: index,
    row: 0,
    col: index,
    questionId: `q-${storyId}-${index + 1}`,
    shortLabel: `${index + 1}번째 조각`,
    areaHint: ['왼쪽 그림 조각', '가운데 그림 조각', '오른쪽 그림 조각'][index],
  }))
  const quizQuestions = questions.map((question, index) => {
    const piece = pieces[index]
    const optionIds = question.options.map((_, optionIndex) => `${storyId}-${index + 1}-option-${optionIndex + 1}`)
    return {
      id: piece.questionId,
      order: index + 1,
      pieceId: piece.pieceId,
      pieceIndex: index,
      prompt: question.prompt,
      options: question.options.map((text, optionIndex) => ({ id: optionIds[optionIndex], text })),
      correctOptionId: optionIds[question.correctOptionIndex],
      hint: question.hint,
      explanation: question.explanation,
      evidence: question.evidence,
    }
  })

  return {
    storyId,
    puzzleId: `puzzle-${storyId}-3piece-v1`,
    title: `${title} 신화 그림 퍼즐`,
    subtitle: '이야기를 읽고 3가지 퀴즈를 맞혀 세 조각 퍼즐을 완성해 보세요!',
    grid: { rows: 1, cols: 3, totalPieces: 3 },
    // Gemini 삽화가 준비되면 각 이야기의 src만 지정하면 기존 3분할 보드가 사용한다.
    artwork: {
      src: pixelArt?.puzzleImage ?? null,
      alt: `${title} 2장면 픽셀 아트`,
      width: pixelArt?.width ?? 1376,
      height: pixelArt?.height ?? 768,
      caption: `${title} · 2장면 픽셀 아트`,
      description: `${title} 이야기의 두 번째 장면을 담은 2D 픽셀 아트예요.`,
      source: null,
    },
    pieces,
    questions: quizQuestions,
  }
}

const ADDITIONAL_MYTH_QUIZZES = [
  {
    storyId: 'samsinin',
    title: '삼성혈',
    questions: [
      {
        prompt: '삼성혈에서 태어났다고 전해지는 세 신인의 이름은 무엇인가요?',
        options: ['고을나·양을나·부을나', '벽랑국의 세 공주', '수월이·녹고·자청비'],
        correctOptionIndex: 0,
        hint: '삼성혈 이야기의 첫 장면에서 세 신인의 이름을 확인해 보세요.',
        explanation: '정답이에요! 고을나·양을나·부을나 세 신인이 삼성혈에서 솟아났다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「삼성혈」 항목 및 검증 기록 #22',
      },
      {
        prompt: '세 신인은 마을 터전을 정하기 전 무엇을 하며 지냈나요?',
        options: ['사냥', '배를 만들어 무역', '벼농사'],
        correctOptionIndex: 0,
        hint: '세 신인이 활을 쏘기 전의 생활을 이야기에서 찾아보세요.',
        explanation: '맞았어요! 세 신인은 사냥하며 지내다가 각자 살아갈 터전을 정하기로 했어요.',
        evidence: '제주신화전설 삽화 설명 CSV 「삼성혈」 항목',
      },
      {
        prompt: '세 신인은 화살을 쏘아 무엇을 정했나요?',
        options: ['살아갈 마을 터전', '제주에 올 첫 배의 이름', '바다의 물고기 종류'],
        correctOptionIndex: 0,
        hint: '한라산 중턱에서 활을 쏜 까닭을 떠올려 보세요.',
        explanation: '정답이에요! 화살이 꽂힌 곳을 각자의 생활 터전으로 정했다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「삼성혈」 항목 및 검증 기록 #22',
      },
    ],
  },
  {
    storyId: 'honinji',
    title: '혼인지',
    questions: [
      {
        prompt: '바다 건너에서 온 세 공주가 살던 나라의 이름은 무엇인가요?',
        options: ['벽랑국', '탐라국', '고구려'],
        correctOptionIndex: 0,
        hint: '삼신인이 바닷가에서 발견한 나무 상자의 주인을 이야기에서 찾아보세요.',
        explanation: '정답이에요! 세 공주는 바다 건너 벽랑국에서 왔다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「삼성혈(삼신인의 3공주)」 항목 및 검증 기록 #23',
      },
      {
        prompt: '세 공주가 제주에 가져온 씨앗은 무엇이었나요?',
        options: ['오곡 씨앗', '유채꽃 씨앗만', '소나무 씨앗만'],
        correctOptionIndex: 0,
        hint: '이 씨앗은 제주에서 농사를 시작하는 데 도움을 주었어요.',
        explanation: '맞았어요! 세 공주는 오곡 씨앗을 가지고 왔다고 이야기돼요.',
        evidence: '제주신화전설 삽화 설명 CSV 「삼성혈(삼신인의 3공주)」 항목 및 검증 기록 #23',
      },
      {
        prompt: '삼신인과 세 공주가 혼례를 올린 곳은 어디인가요?',
        options: ['혼인지 연못', '수월봉 절벽', '삼성혈 구멍'],
        correctOptionIndex: 0,
        hint: '이야기 제목에 들어 있는 장소 이름을 떠올려 보세요.',
        explanation: '정답이에요! 세 쌍은 맑은 연못가에서 혼례를 올렸고, 그곳을 혼인지라 불러요.',
        evidence: '제주신화전설 삽화 설명 CSV 「삼성혈(삼신인의 3공주)」 항목 및 검증 기록 #23',
      },
    ],
  },
  {
    storyId: 'jacheongbi',
    title: '자청비',
    questions: [
      {
        prompt: '자청비가 다시 만나기 위해 여러 시험을 이겨 낸 하늘나라 청년은 누구인가요?',
        options: ['문도령', '고을나', '녹고'],
        correctOptionIndex: 0,
        hint: '자청비 이야기의 첫 장면에 나오는 청년 이름을 확인해 보세요.',
        explanation: '맞았어요! 자청비는 천상의 청년 문도령을 만나기 위해 어려운 시험을 이겨냈어요.',
        evidence: '제주신화전설 삽화 설명 CSV 「자청비1」 항목 및 검증 기록 #44',
      },
      {
        prompt: '자청비가 하늘에서 가져와 땅에 뿌린 것은 무엇인가요?',
        options: ['오곡 씨앗', '바닷물 한 병', '돌 세 개'],
        correctOptionIndex: 0,
        hint: '사람들이 농사를 지을 수 있게 해 준 선물이에요.',
        explanation: '정답이에요! 자청비는 하늘에서 오곡 씨앗을 받아와 땅에 뿌렸다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「자청비2」 항목 및 검증 기록 #45',
      },
      {
        prompt: '제주 사람들은 자청비를 어떤 일을 돕는 신으로 모셨나요?',
        options: ['농사와 풍년', '바닷길과 항해', '대장간의 불'],
        correctOptionIndex: 0,
        hint: '자청비가 가져온 씨앗과 관계있는 일을 생각해 보세요.',
        explanation: '맞았어요! 자청비는 농경과 오곡을 맡은 농사의 여신으로 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「자청비1·자청비2」 항목 및 검증 기록 #44–45',
      },
    ],
  },
  {
    storyId: 'suwolbong',
    title: '수월봉과 녹고물',
    questions: [
      {
        prompt: '수월이와 녹고가 어머니를 위해 절벽에서 찾던 약초는 무엇인가요?',
        options: ['오갈피', '인삼', '동백꽃'],
        correctOptionIndex: 0,
        hint: '수월봉 이야기 첫 장면에서 마지막으로 찾던 약초를 떠올려 보세요.',
        explanation: '정답이에요! 누나 수월이는 절벽에서 오갈피를 캐려다 떨어졌다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「수월봉과 녹고물」 항목 및 검증 기록 #31',
      },
      {
        prompt: '절벽에서 떨어진 사람은 누구였나요?',
        options: ['누나 수월이', '동생 녹고', '어머니'],
        correctOptionIndex: 0,
        hint: '약초를 캐러 절벽 아래로 내려간 인물을 찾아보세요.',
        explanation: '맞았어요! 누나 수월이가 절벽 아래로 떨어졌고, 동생 녹고는 슬퍼했어요.',
        evidence: '제주신화전설 삽화 설명 CSV 「수월봉과 녹고물」 항목 및 검증 기록 #31',
      },
      {
        prompt: '동생 녹고의 눈물은 무엇이 되었다고 전해지나요?',
        options: ['절벽에서 흐르는 샘물', '한라산의 눈', '바다의 파도'],
        correctOptionIndex: 0,
        hint: '장소 이름에도 들어 있는 물의 이름을 찾아보세요.',
        explanation: '정답이에요! 녹고의 눈물이 샘이 되어 흘렀고, 그 샘물을 녹고물이라 불러요.',
        evidence: '제주신화전설 삽화 설명 CSV 「수월봉과 녹고물」 항목 및 검증 기록 #31',
      },
    ],
  },
  {
    storyId: 'sanbangdeok',
    title: '산방덕이',
    questions: [
      {
        prompt: '산방덕이가 태어났다고 전해지는 곳은 어디인가요?',
        options: ['산방산의 바위 동굴', '삼성혈의 세 구멍', '혼인지 연못'],
        correctOptionIndex: 0,
        hint: '전설의 주인공 이름과 비슷한 산의 동굴을 생각해 보세요.',
        explanation: '맞았어요! 산방덕이는 산방산의 암굴에서 태어난 여신으로 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「산방덕이1」 항목 및 검증 기록 #18–20',
      },
      {
        prompt: '산방덕이의 남편 고씨에게 어떤 일이 생겼나요?',
        options: ['억울한 누명으로 귀양을 갔어요', '바다 건너 왕이 되었어요', '하늘로 올라가 신이 되었어요'],
        correctOptionIndex: 0,
        hint: '산방덕이가 다시 동굴로 돌아간 까닭과 이어지는 사건이에요.',
        explanation: '정답이에요! 이야기에서는 관리가 고씨에게 억울한 누명을 씌워 귀양 보냈다고 해요.',
        evidence: '제주신화전설 삽화 설명 CSV 「산방덕이1」 항목 및 검증 기록 #18–20',
      },
      {
        prompt: '산방덕이가 동굴로 돌아간 뒤 무엇이 되었다고 전해지나요?',
        options: ['동굴의 바위', '큰 소나무', '바다의 용'],
        correctOptionIndex: 0,
        hint: '산방산 동굴 안에서 볼 수 있는 자연물을 떠올려 보세요.',
        explanation: '맞았어요! 산방덕이는 산방산 동굴로 돌아가 바위가 되었다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「산방덕이2」 항목 및 검증 기록 #18–20',
      },
    ],
  },
  {
    storyId: 'yeongdeung',
    title: '영등할망',
    questions: [
      {
        prompt: '영등할망이 제주를 찾아오는 때는 언제인가요?',
        options: ['음력 2월', '양력 8월', '겨울 동짓날'],
        correctOptionIndex: 0,
        hint: '봄바람이 불기 시작하는 음력 달을 이야기에서 확인해 보세요.',
        explanation: '정답이에요! 영등할망은 해마다 음력 2월에 제주를 찾아온다고 전해져요.',
        evidence: '제주신화전설 삽화 설명 CSV 「영등할망 전설」 항목 및 검증 기록 #36',
      },
      {
        prompt: '영등할망은 제주 바다에 어떤 풍요를 가져다준다고 하나요?',
        options: ['미역·소라·전복의 씨앗', '산에서 나는 감귤 씨앗', '강의 민물고기 알'],
        correctOptionIndex: 0,
        hint: '제주 해녀들이 바다에서 만나는 먹거리를 떠올려 보세요.',
        explanation: '맞았어요! 영등할망은 바다를 돌며 미역과 소라, 전복의 씨앗을 뿌려 준다고 해요.',
        evidence: '제주신화전설 삽화 설명 CSV 「영등할망 전설」 항목 및 검증 기록 #36',
      },
      {
        prompt: '바다의 평안과 풍어를 빌기 위해 여는 제주의 굿은 무엇인가요?',
        options: ['영등굿', '영실굿', '오름굿'],
        correctOptionIndex: 0,
        hint: '영등할망의 이름이 들어가는 굿이에요.',
        explanation: '정답이에요! 제주 해녀와 어부들은 영등굿을 열어 바다의 평안과 풍어를 빌어요.',
        evidence: '제주신화전설 삽화 설명 CSV 「영등할망 전설」 항목 및 검증 기록 #36',
      },
    ],
  },
]

for (const quiz of ADDITIONAL_MYTH_QUIZZES) {
  MYTH_QUIZ_PUZZLES[quiz.storyId] = createThreePiecePuzzle(quiz)
}

/**
 * 특정 신화의 퍼즐 설정을 반환한다.
 */
export function getMythQuizPuzzle(storyId) {
  return MYTH_QUIZ_PUZZLES[storyId] || null
}

/**
 * 정답 제출 결과를 계산하는 순수 함수.
 * - 이미 해결한 문제(solvedQuestionIds)와 열린 조각(unlockedPieceIds)은 절대 다시 가려지지 않는다.
 * - 같은 문제를 반복해서 맞혀도 조각을 중복 지급하지 않는다(alreadySolved 플래그 반환).
 * - 문제 순서와 무관하게 question.pieceId로 조각을 정확히 매핑한다.
 */
export function evaluateQuizSubmission(puzzleConfig, currentProgress, questionId, selectedOptionId) {
  const safeSolved = Array.isArray(currentProgress?.solvedQuestionIds)
    ? [...currentProgress.solvedQuestionIds]
    : []
  const safeUnlocked = Array.isArray(currentProgress?.unlockedPieceIds)
    ? [...currentProgress.unlockedPieceIds]
    : []

  const question = puzzleConfig?.questions?.find((q) => q.id === questionId)
  if (!question) {
    return {
      isValid: false,
      isCorrect: false,
      alreadySolved: false,
      newlyUnlockedPieceId: null,
      justCompleted: false,
      nextProgress: {
        solvedQuestionIds: safeSolved,
        unlockedPieceIds: safeUnlocked,
        isCompleted: safeUnlocked.length === (puzzleConfig?.grid?.totalPieces ?? 0),
      },
    }
  }

  const isCorrect = question.correctOptionId === selectedOptionId
  const alreadySolved = safeSolved.includes(question.id)

  if (!isCorrect) {
    // 오답이더라도 기존에 맞힌 문제와 열린 조각은 절대 가려지지 않음
    return {
      isValid: true,
      isCorrect: false,
      alreadySolved,
      newlyUnlockedPieceId: null,
      justCompleted: false,
      nextProgress: {
        solvedQuestionIds: safeSolved,
        unlockedPieceIds: safeUnlocked,
        isCompleted: safeUnlocked.length === puzzleConfig.grid.totalPieces,
      },
    }
  }

  // 정답인 경우: 고유 ID 기준으로 중복 없이 병합
  const nextSolved = alreadySolved ? safeSolved : [...safeSolved, question.id]
  const pieceAlreadyOpen = safeUnlocked.includes(question.pieceId)
  const nextUnlocked = pieceAlreadyOpen ? safeUnlocked : [...safeUnlocked, question.pieceId]

  const wasCompleted = safeUnlocked.length === puzzleConfig.grid.totalPieces
  const isNowCompleted = nextUnlocked.length === puzzleConfig.grid.totalPieces

  return {
    isValid: true,
    isCorrect: true,
    alreadySolved: alreadySolved && pieceAlreadyOpen,
    newlyUnlockedPieceId: pieceAlreadyOpen ? null : question.pieceId,
    justCompleted: !wasCompleted && isNowCompleted,
    nextProgress: {
      solvedQuestionIds: nextSolved,
      unlockedPieceIds: nextUnlocked,
      isCompleted: isNowCompleted,
    },
  }
}
