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
      "手や体を動かしてモノを扱うことが得意で、失敗と修正を繰り返しながら完成させる試行錯誤のプロセスを楽しめます。また、空間把握力や工具の扱い・機械の仕組みを理解するハードスキルにも強みがあります。イメージ：大工／自動車整備士／パティシエ／森林レンジャー",
    color: "from-blue-500 to-blue-700",
    icon: "Wrench",
  },
  I: {
    name: "研究的 (Investigative)",
    description:
      "「なぜ？」を掘り下げ、データや実験で答えを確かめることが好きで、仮説→検証→考察のサイクルに大きなやりがいを感じます。ロジカルシンキングと情報整理も得意なため、研究や分析の分野で力を発揮しやすいです。イメージ：医師／薬剤師／気象予報士／データサイエンティスト",
    color: "from-purple-500 to-purple-700",
    icon: "Microscope",
  },
  A: {
    name: "芸術的 (Artistic)",
    description:
      "絵・音楽・文章など自由な表現でアイデアを形にすることが得意で、正解が一つに定まらない課題ほど創造力が高まります。さらに、作品づくりの背後にあるコンセプト設計やストーリー構築にも関心を示しやすいです。イメージ：グラフィックデザイナー／作曲家／漫画家／映像クリエイター",
    color: "from-pink-500 to-pink-700",
    icon: "Palette",
  },
  S: {
    name: "社会的 (Social)",
    description: "人を助けたり教えたりすることでエネルギーを得られ、共感力と対話力に優れています。チームの雰囲気を読み取り、相手に合わせたコミュニケーションを自然に行える点も強みです。イメージ：先生／看護師／保育士／カウンセラー",
    color: "from-yellow-500 to-yellow-700",
    icon: "Users",
  },
  E: {
    name: "企業的 (Enterprising)",
    description:
      "アイデアを企画し、チームをまとめて目標を達成へ導くことが得意で、説得力のある話し方が武器になります。数字（売上・目標値）とビジョン（物語性）の両方を大切にする傾向があります。イメージ：起業家／営業職／イベントプランナー／ショップ店長",
    color: "from-red-500 to-red-700",
    icon: "TrendingUp",
  },
  C: {
    name: "慣習的 (Conventional)",
    description:
      "情報を整理し、ルール通りに正確に進めることが得意で、細かなミスを見つけるチェック力が高いです。また、手順化やマニュアル化を好み、効率を上げる方法を考えるとモチベーションが上がります。イメージ：事務職／経理／銀行員／図書館司書",
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
