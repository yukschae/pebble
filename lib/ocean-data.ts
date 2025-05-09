/**
 * OCEANデータと分析ロジック
 *
 * このファイルは、OCEAN（ビッグファイブ性格特性）分析に必要なデータと分析ロジックを提供します。
 *
 * 主な機能：
 * - OCEAN質問項目の定義
 * - OCEAN因子の定義（名前、説明、色など）
 * - 回答データの分析と結果計算
 * - 結果の解釈生成
 * - 職業提案
 *
 * データ構造：
 * - oceanFactors: 各因子の詳細情報
 * - oceanQuestions: 質問項目の配列
 *
 * 主要な関数：
 * - calculateOceanScores: 回答データからスコアを計算
 * - getOceanLevels: スコアからレベル（高い・中間・低い）を判定
 * - generateOceanInterpretation: 結果の解釈を生成
 * - suggestOceanCareers: スコアに基づいて職業を提案
 *
 * 関連ファイル：
 * - app/ocean/assessment/page.tsx (分析ページ)
 * - app/ocean/results/page.tsx (結果ページ)
 */

// ビッグファイブ（OCEAN）の各因子の定義
export const oceanFactors = {
  O: {
    name: "開放性",
    nameEn: "Openness",
    description: "新しい経験や考え方に対する好奇心や受容性を表します。芸術的、創造的、冒険的な傾向があります。",
    highDescription: "好奇心が強く、創造的で、新しいアイデアや経験に開かれています。芸術や抽象的な思考を楽しみます。",
    lowDescription: "実用的で伝統的、具体的な考え方を好みます。急激な変化よりも慣れ親しんだ環境を好みます。",
    color: "from-purple-500 to-indigo-600",
    icon: "✨",
  },
  C: {
    name: "誠実性",
    nameEn: "Conscientiousness",
    description: "計画性、責任感、自己規律を表します。目標達成のために努力し、信頼性が高い傾向があります。",
    highDescription: "組織的で、計画的、責任感があります。目標に向かって努力し、細部に注意を払います。",
    lowDescription:
      "自発的で、柔軟性がありますが、時に計画性に欠けることがあります。締め切りや約束を守るのが難しいことも。",
    color: "from-blue-500 to-cyan-600",
    icon: "📝",
  },
  E: {
    name: "外向性",
    nameEn: "Extraversion",
    description: "社交性、活発さ、自己主張の強さを表します。人との交流からエネルギーを得る傾向があります。",
    highDescription: "社交的で活発、自己主張が強いです。グループ活動を楽しみ、人との交流からエネルギーを得ます。",
    lowDescription: "静かで内省的、一人の時間を大切にします。少人数との深い関係を好む傾向があります。",
    color: "from-amber-500 to-orange-600",
    icon: "🌟",
  },
  A: {
    name: "協調性",
    nameEn: "Agreeableness",
    description: "思いやり、協力性、他者への信頼を表します。人間関係を大切にし、調和を重視する傾向があります。",
    highDescription: "思いやりがあり、協力的で、他者を信頼します。調和を重視し、対立を避ける傾向があります。",
    lowDescription: "直接的で率直、時に批判的になることがあります。個人の目標や真実を重視する傾向があります。",
    color: "from-green-500 to-emerald-600",
    icon: "🤝",
  },
  N: {
    name: "神経症的傾向",
    nameEn: "Neuroticism",
    description: "感情の不安定さ、ストレスへの敏感さを表します。不安や緊張を感じやすい傾向があります。",
    highDescription: "感情の起伏が大きく、ストレスや不安を感じやすいです。状況に敏感に反応する傾向があります。",
    lowDescription: "感情的に安定しており、ストレスに強いです。困難な状況でも冷静さを保つことができます。",
    color: "from-red-500 to-pink-600",
    icon: "🌊",
  },
}

// 質問項目（各因子10問ずつ、合計50問）
export const oceanQuestions = [
  // 開放性 (O)
  {
    id: "O1",
    text: "新しいアイデアや概念について考えるのが好きだ",
    factor: "O",
    reverse: false,
  },
  {
    id: "O2",
    text: "芸術、音楽、文学などの創造的な活動に興味がある",
    factor: "O",
    reverse: false,
  },
  {
    id: "O3",
    text: "抽象的な概念や理論について考えるのが好きだ",
    factor: "O",
    reverse: false,
  },
  {
    id: "O4",
    text: "想像力が豊かだと思う",
    factor: "O",
    reverse: false,
  },
  {
    id: "O5",
    text: "新しい場所や文化を体験するのが好きだ",
    factor: "O",
    reverse: false,
  },
  {
    id: "O6",
    text: "日常的な習慣や決まりきったやり方を好む",
    factor: "O",
    reverse: true,
  },
  {
    id: "O7",
    text: "哲学的な議論や深い思索に興味がある",
    factor: "O",
    reverse: false,
  },
  {
    id: "O8",
    text: "芸術作品（絵画、音楽、文学など）に感動することがある",
    factor: "O",
    reverse: false,
  },
  {
    id: "O9",
    text: "複雑な問題を解決するのが好きだ",
    factor: "O",
    reverse: false,
  },
  {
    id: "O10",
    text: "新しい趣味や活動に挑戦するのが好きだ",
    factor: "O",
    reverse: false,
  },

  // 誠実性 (C)
  {
    id: "C1",
    text: "計画を立ててから行動することが多い",
    factor: "C",
    reverse: false,
  },
  {
    id: "C2",
    text: "約束や締め切りを守ることを重視している",
    factor: "C",
    reverse: false,
  },
  {
    id: "C3",
    text: "細部に注意を払うことが得意だ",
    factor: "C",
    reverse: false,
  },
  {
    id: "C4",
    text: "整理整頓が得意だ",
    factor: "C",
    reverse: false,
  },
  {
    id: "C5",
    text: "目標を達成するために努力し続けることができる",
    factor: "C",
    reverse: false,
  },
  {
    id: "C6",
    text: "物事を先延ばしにすることがよくある",
    factor: "C",
    reverse: true,
  },
  {
    id: "C7",
    text: "自分の責任を果たすことを重要視している",
    factor: "C",
    reverse: false,
  },
  {
    id: "C8",
    text: "効率的に作業を進めることができる",
    factor: "C",
    reverse: false,
  },
  {
    id: "C9",
    text: "自分の行動に対して責任を持つことができる",
    factor: "C",
    reverse: false,
  },
  {
    id: "C10",
    text: "計画通りに物事を進めるのが好きだ",
    factor: "C",
    reverse: false,
  },

  // 外向性 (E)
  {
    id: "E1",
    text: "人と話すのが好きだ",
    factor: "E",
    reverse: false,
  },
  {
    id: "E2",
    text: "パーティーや社交の場で楽しむことができる",
    factor: "E",
    reverse: false,
  },
  {
    id: "E3",
    text: "新しい人と出会うのが好きだ",
    factor: "E",
    reverse: false,
  },
  {
    id: "E4",
    text: "グループの中心になることが多い",
    factor: "E",
    reverse: false,
  },
  {
    id: "E5",
    text: "自分の意見や考えを積極的に発言する",
    factor: "E",
    reverse: false,
  },
  {
    id: "E6",
    text: "一人で過ごす時間が好きだ",
    factor: "E",
    reverse: true,
  },
  {
    id: "E7",
    text: "活発で、エネルギッシュだと思う",
    factor: "E",
    reverse: false,
  },
  {
    id: "E8",
    text: "会話を始めるのが得意だ",
    factor: "E",
    reverse: false,
  },
  {
    id: "E9",
    text: "人前で話すのが苦にならない",
    factor: "E",
    reverse: false,
  },
  {
    id: "E10",
    text: "冒険や刺激を求める傾向がある",
    factor: "E",
    reverse: false,
  },

  // 協調性 (A)
  {
    id: "A1",
    text: "他人の気持ちに共感することができる",
    factor: "A",
    reverse: false,
  },
  {
    id: "A2",
    text: "人を信頼する傾向がある",
    factor: "A",
    reverse: false,
  },
  {
    id: "A3",
    text: "他人を助けることに喜びを感じる",
    factor: "A",
    reverse: false,
  },
  {
    id: "A4",
    text: "協力して作業することが好きだ",
    factor: "A",
    reverse: false,
  },
  {
    id: "A5",
    text: "人との対立や争いを避けようとする",
    factor: "A",
    reverse: false,
  },
  {
    id: "A6",
    text: "時々、他人に対して批判的になることがある",
    factor: "A",
    reverse: true,
  },
  {
    id: "A7",
    text: "他人の意見や立場を尊重することができる",
    factor: "A",
    reverse: false,
  },
  {
    id: "A8",
    text: "思いやりがあると言われることが多い",
    factor: "A",
    reverse: false,
  },
  {
    id: "A9",
    text: "人間関係において寛容さを大切にしている",
    factor: "A",
    reverse: false,
  },
  {
    id: "A10",
    text: "他人の幸せを願う気持ちが強い",
    factor: "A",
    reverse: false,
  },

  // 神経症的傾向 (N)
  {
    id: "N1",
    text: "ストレスを感じやすい",
    factor: "N",
    reverse: false,
  },
  {
    id: "N2",
    text: "心配事が多い",
    factor: "N",
    reverse: false,
  },
  {
    id: "N3",
    text: "感情の起伏が激しいことがある",
    factor: "N",
    reverse: false,
  },
  {
    id: "N4",
    text: "緊張しやすい性格だ",
    factor: "N",
    reverse: false,
  },
  {
    id: "N5",
    text: "批判されると落ち込むことが多い",
    factor: "N",
    reverse: false,
  },
  {
    id: "N6",
    text: "困難な状況でも冷静さを保つことができる",
    factor: "N",
    reverse: true,
  },
  {
    id: "N7",
    text: "小さなことでもイライラすることがある",
    factor: "N",
    reverse: false,
  },
  {
    id: "N8",
    text: "将来について不安に感じることが多い",
    factor: "N",
    reverse: false,
  },
  {
    id: "N9",
    text: "気分の変動が激しいと感じることがある",
    factor: "N",
    reverse: false,
  },
  {
    id: "N10",
    text: "プレッシャーを感じると混乱することがある",
    factor: "N",
    reverse: false,
  },
]

// 回答のスコア計算
export function calculateOceanScores(responses: Record<string, number>) {
  // 各因子のスコアを初期化
  const scores: Record<string, number> = {
    O: 0, // 開放性
    C: 0, // 誠実性
    E: 0, // 外向性
    A: 0, // 協調性
    N: 0, // 神経症的傾向
  }

  // 各因子の質問数をカウント
  const counts: Record<string, number> = {
    O: 0,
    C: 0,
    E: 0,
    A: 0,
    N: 0,
  }

  // 各質問のスコアを計算して合計する
  oceanQuestions.forEach((question) => {
    const response = responses[question.id]
    if (response !== undefined) {
      // 逆転項目の場合はスコアを反転（7点スケールの場合）
      const score = question.reverse ? 8 - response : response
      scores[question.factor] += score
      counts[question.factor]++
    }
  })

  // 各因子の平均スコアを計算（0-100に正規化）
  const normalizedScores: Record<string, number> = {}
  Object.keys(scores).forEach((factor) => {
    if (counts[factor] > 0) {
      // 平均スコアを計算（1-7スケール）
      const avgScore = scores[factor] / counts[factor]
      // 0-100スケールに変換（1→0, 7→100）
      normalizedScores[factor] = Math.round(((avgScore - 1) / 6) * 100)
    } else {
      normalizedScores[factor] = 0
    }
  })

  return normalizedScores
}

// 各因子のレベル（高い・中間・低い）を判定
export function getOceanLevels(scores: Record<string, number>) {
  const levels: Record<string, string> = {}

  Object.keys(scores).forEach((factor) => {
    const score = scores[factor]
    if (score >= 70) {
      levels[factor] = "高い"
    } else if (score >= 30) {
      levels[factor] = "中間"
    } else {
      levels[factor] = "低い"
    }
  })

  return levels
}

// 結果の解釈を生成
export function generateOceanInterpretation(scores: Record<string, number>) {
  const levels = getOceanLevels(scores)
  const interpretation: Record<string, string> = {}

  Object.keys(levels).forEach((factor) => {
    const level = levels[factor]
    const factorInfo = oceanFactors[factor as keyof typeof oceanFactors]

    if (level === "高い") {
      interpretation[factor] = factorInfo.highDescription
    } else if (level === "低い") {
      interpretation[factor] = factorInfo.lowDescription
    } else {
      interpretation[factor] = "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。"
    }
  })

  return interpretation
}

// 因子をスコア順にソート
export function sortFactorsByScore(scores: Record<string, number>) {
  return Object.keys(scores).sort((a, b) => scores[b] - scores[a])
}

// 職業提案
export function suggestOceanCareers(scores: Record<string, number>) {
  const sortedFactors = sortFactorsByScore(scores)
  const topFactor = sortedFactors[0]
  const secondFactor = sortedFactors[1]

  const careerSuggestions: Record<string, string[]> = {
    O: ["芸術家", "デザイナー", "研究者", "作家", "ジャーナリスト", "建築家", "大学教授", "コンサルタント"],
    C: [
      "会計士",
      "プロジェクトマネージャー",
      "法律家",
      "エンジニア",
      "医師",
      "金融アナリスト",
      "システム管理者",
      "品質管理マネージャー",
    ],
    E: ["営業担当者", "マーケティング担当者", "広報担当者", "政治家", "イベントプランナー", "俳優", "教師", "起業家"],
    A: [
      "カウンセラー",
      "看護師",
      "ソーシャルワーカー",
      "教師",
      "人事担当者",
      "顧客サービス担当者",
      "セラピスト",
      "非営利団体スタッフ",
    ],
    N: ["詩人", "芸術家", "音楽家", "作家", "セラピスト", "研究者", "批評家", "リスク分析専門家"],
  }

  // 上位2つの因子に基づいた職業提案
  const topFactorCareers = careerSuggestions[topFactor] || []
  const secondFactorCareers = careerSuggestions[secondFactor] || []

  // 両方の因子に関連する職業を提案
  const combinedSuggestions: Record<string, string[]> = {
    OC: ["研究者", "科学者", "エンジニア", "建築家", "データアナリスト"],
    OE: ["マーケティングディレクター", "起業家", "クリエイティブディレクター", "ジャーナリスト", "講演者"],
    OA: ["教師", "カウンセラー", "作家", "芸術療法士", "人文科学研究者"],
    ON: ["芸術家", "作家", "音楽家", "哲学者", "映画監督"],
    CE: ["経営者", "プロジェクトマネージャー", "政治家", "弁護士", "金融アドバイザー"],
    CA: ["医師", "薬剤師", "看護管理者", "教育管理者", "非営利団体マネージャー"],
    CN: ["品質管理専門家", "編集者", "批評家", "リスク管理者", "監査役"],
    EA: ["セールスマネージャー", "教師", "コーチ", "人事マネージャー", "カスタマーサクセスマネージャー"],
    EN: ["俳優", "営業担当者", "スポーツ選手", "政治家", "メディアパーソナリティ"],
    AN: ["セラピスト", "カウンセラー", "ソーシャルワーカー", "看護師", "心理学者"],
  }

  // 上位2つの因子の組み合わせを取得
  const factorCombo = [topFactor, secondFactor].sort().join("")
  const combinedCareers = combinedSuggestions[factorCombo] || []

  return {
    topFactor,
    secondFactor,
    topFactorCareers,
    secondFactorCareers,
    combinedCareers,
  }
}
