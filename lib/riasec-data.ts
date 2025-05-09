/**
 * RIASECデータと分析ロジック
 *
 * このファイルは、RIASEC（職業興味）分析に必要なデータと分析ロジックを提供します。
 *
 * 主な機能：
 * - RIASEC質問項目の定義
 * - RIASEC次元の定義（名前、説明、色など）
 * - 回答データの分析と結果計算
 * - 一貫性と分化度の計算
 *
 * データ構造：
 * - riasecQuestions: 質問項目の配列
 * - riasecDimensions: 各次元の詳細情報
 *
 * 主要な関数：
 * - calculateRiasecResults: 回答データから結果を計算
 * - calculateConsistency: 一貫性スコアを計算
 *
 * 関連ファイル：
 * - app/riasec/assessment/page.tsx (分析ページ)
 * - app/riasec/results/page.tsx (結果ページ)
 */

// RIASEC分析の質問項目
export const riasecQuestions = [
  {
    id: 1,
    text: "機械や道具を使って物を作ることが好きだ",
    dimension: "R", // Realistic
  },
  {
    id: 2,
    text: "科学的な問題を解決することに興味がある",
    dimension: "I", // Investigative
  },
  {
    id: 3,
    text: "創造的な活動（絵画、音楽、文章など）を楽しむ",
    dimension: "A", // Artistic
  },
  {
    id: 4,
    text: "他の人を助けたり教えたりすることが好きだ",
    dimension: "S", // Social
  },
  {
    id: 5,
    text: "リーダーシップを発揮して人をまとめることが得意だ",
    dimension: "E", // Enterprising
  },
  {
    id: 6,
    text: "細かい作業や事務的な仕事が好きだ",
    dimension: "C", // Conventional
  },
  {
    id: 7,
    text: "屋外での活動や体を動かす仕事に興味がある",
    dimension: "R",
  },
  {
    id: 8,
    text: "複雑な問題を分析して解決策を見つけることが好きだ",
    dimension: "I",
  },
  {
    id: 9,
    text: "自分の感情や考えを表現する方法を探すのが好きだ",
    dimension: "A",
  },
  {
    id: 10,
    text: "チームで協力して働くことが好きだ",
    dimension: "S",
  },
  {
    id: 11,
    text: "自分のアイデアを他者に売り込むことが得意だ",
    dimension: "E",
  },
  {
    id: 12,
    text: "明確なルールや指示に従って作業することが好きだ",
    dimension: "C",
  },
  {
    id: 13,
    text: "物を修理したり組み立てたりすることが好きだ",
    dimension: "R",
  },
  {
    id: 14,
    text: "新しい知識を得ることに喜びを感じる",
    dimension: "I",
  },
  {
    id: 15,
    text: "独創的なアイデアを考えることが好きだ",
    dimension: "A",
  },
  {
    id: 16,
    text: "他者の成長や発展を手助けすることにやりがいを感じる",
    dimension: "S",
  },
  {
    id: 17,
    text: "目標を達成するために人々を説得することが得意だ",
    dimension: "E",
  },
  {
    id: 18,
    text: "データを整理して管理することが好きだ",
    dimension: "C",
  },
  {
    id: 19,
    text: "手を使って何かを作ることに満足感を覚える",
    dimension: "R",
  },
  {
    id: 20,
    text: "物事の仕組みを理解するために調査や研究をすることが好きだ",
    dimension: "I",
  },
]

// RIASEC次元の説明
export const riasecDimensions = {
  R: {
    name: "現実的 (Realistic)",
    description:
      "機械や道具を使って具体的で目に見える成果を生み出すことを好みます。実践的で、手先が器用で、物事を組み立てたり修理したりすることが得意です。",
    color: "from-blue-500 to-blue-700",
    icon: "Wrench",
  },
  I: {
    name: "研究的 (Investigative)",
    description:
      "複雑な問題を分析し、科学的な方法で解決策を見つけることを好みます。知的好奇心が強く、論理的思考が得意です。",
    color: "from-purple-500 to-purple-700",
    icon: "Microscope",
  },
  A: {
    name: "芸術的 (Artistic)",
    description:
      "創造的な活動を通じて自己表現することを好みます。独創的で、想像力豊かで、従来の枠にとらわれない考え方をします。",
    color: "from-pink-500 to-pink-700",
    icon: "Palette",
  },
  S: {
    name: "社会的 (Social)",
    description: "他者を助け、教え、サポートすることを好みます。協力的で、思いやりがあり、人間関係を大切にします。",
    color: "from-yellow-500 to-yellow-700",
    icon: "Users",
  },
  E: {
    name: "企業的 (Enterprising)",
    description:
      "リーダーシップを発揮し、他者を説得して目標を達成することを好みます。自信があり、社交的で、冒険心があります。",
    color: "from-red-500 to-red-700",
    icon: "TrendingUp",
  },
  C: {
    name: "慣習的 (Conventional)",
    description:
      "明確なルールや指示に従って、データや情報を整理することを好みます。細部に注意を払い、正確で、秩序立った環境で働くことを好みます。",
    color: "from-green-500 to-green-700",
    icon: "ClipboardList",
  },
}

// RIASEC分析の結果を計算する関数
export function calculateRiasecResults(responses: Record<number, number>) {
  // 各次元のスコアを初期化
  const dimensionScores: Record<string, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  }

  // 各質問の回答を集計
  riasecQuestions.forEach((question) => {
    const response = responses[question.id]
    if (response) {
      dimensionScores[question.dimension] += response
    }
  })

  // 各次元の質問数を計算
  const dimensionCounts: Record<string, number> = {
    R: 0,
    I: 0,
    A: 0,
    S: 0,
    E: 0,
    C: 0,
  }

  riasecQuestions.forEach((question) => {
    dimensionCounts[question.dimension]++
  })

  // 各次元の平均スコアを計算（0-100に正規化）
  const normalizedScores: Record<string, number> = {}
  Object.keys(dimensionScores).forEach((dim) => {
    const maxPossible = dimensionCounts[dim] * 7 // 7段階評価の最大値
    normalizedScores[dim] = Math.round((dimensionScores[dim] / maxPossible) * 100)
  })

  // 次元をスコア順にソート
  const sortedDimensions = Object.keys(normalizedScores).sort((a, b) => normalizedScores[b] - normalizedScores[a])

  // 3文字コードを生成
  const threeLetterCode = sortedDimensions.slice(0, 3).join("")

  // 一貫性（Consistency）の計算
  // 隣接する次元は類似性が高い（一貫性が高い）
  const hexagonOrder = ["R", "I", "A", "S", "E", "C"]
  const consistencyScore = calculateConsistency(sortedDimensions[0], sortedDimensions[1], hexagonOrder)

  // 分化度（Differentiation）の計算
  // 最高スコアと最低スコアの差
  const maxScore = Math.max(...Object.values(normalizedScores))
  const minScore = Math.min(...Object.values(normalizedScores))
  const differentiationScore = maxScore - minScore

  return {
    dimensionScores: normalizedScores,
    sortedDimensions,
    threeLetterCode,
    consistency: consistencyScore,
    differentiation: differentiationScore,
  }
}

// 一貫性（Consistency）を計算する関数
function calculateConsistency(dim1: string, dim2: string, hexagonOrder: string[]) {
  const index1 = hexagonOrder.indexOf(dim1)
  const index2 = hexagonOrder.indexOf(dim2)

  // 六角形上の距離を計算
  let distance = Math.abs(index1 - index2)
  if (distance > 3) {
    distance = 6 - distance // 反対側の距離を計算
  }

  // 距離に基づいて一貫性スコアを返す
  switch (distance) {
    case 0:
      return 3 // 同じ次元（最高の一貫性）
    case 1:
      return 3 // 隣接する次元（高い一貫性）
    case 2:
      return 2 // 1つ飛ばした次元（中程度の一貫性）
    case 3:
      return 1 // 反対側の次元（低い一貫性）
    default:
      return 0
  }
}
