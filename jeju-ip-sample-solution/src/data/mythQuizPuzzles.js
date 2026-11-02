import { MYTH_SOURCE } from './mythStories.js'

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
    subtitle: '이야기 속 3가지 퀴즈를 맞히고 가려진 설문대할망 공식 삽화를 완성해 보세요!',
    grid: {
      rows: 1,
      cols: 3,
      totalPieces: 3,
    },
    artwork: {
      src: '/myth/seolmundae-2.jpg',
      alt: '설문대할망과 오백장군 전설 공식 삽화',
      width: 1100,
      height: 713,
      caption: '설문대할망과 오백장군 전설 (공공데이터포털 원본 삽화 · 16_8_20160725-02)',
      description:
        '설문대할망이 오백 명의 아들들에게 줄 죽을 끓이던 큰 가마솥과 어머니를 그리워하는 오백장군의 모습을 담은 제주특별자치도 공식 신화 삽화예요.',
      source: MYTH_SOURCE,
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
