import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { getSelectedQuestDirection } from "@/lib/supabase"

export const maxDuration = 30

export async function POST(req: Request) {
  try {
    // APIキーが設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // リクエストボディを取得
    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      // クエスト方向性を取得
      const questDirection = await getSelectedQuestDirection(userId)

      if (!questDirection) {
        return new Response(JSON.stringify({ error: "No quest direction found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      // プロンプトを生成
      const prompt = `
あなたは探究学習のエキスパートです。以下のクエスト方向性に基づいて、様々な難易度の探究クエストを10個提案してください。

クエスト方向性：「${questDirection.title}」
説明：${questDirection.description}
タグ：${questDirection.tags.join(", ")}

各クエストには以下の要素を含めてください：
1. タイトル：具体的で魅力的なクエストタイトル
2. 説明：クエストの概要（100-150文字程度）
3. 行動例：具体的なアクション（3-4個）
4. 成果物：クエスト完了時に得られる成果物
5. 難易度：1（非常に簡単）～5（非常に難しい）の5段階で評価
6. 順序：1～10の順番（難易度順ではなく、論理的な進行順）

難易度1～5のクエストをバランスよく含めてください。

回答は以下のJSON形式で返してください：
{
  "quests": [
    {
      "title": "クエストタイトル",
      "description": "クエストの説明...",
      "actions": ["行動例1", "行動例2", "行動例3"],
      "outcome": "成果物の説明",
      "difficulty": 3,
      "order": 1
    },
    ...
  ]
}

JSONのみを返してください。説明や前置きは不要です。
`

      // AI SDKを使用してテキストを生成
      const { text } = await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 3000,
      })

      // JSONをパース
      let quests
      try {
        quests = JSON.parse(text)
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError, text)
        throw new Error("Invalid JSON response from AI")
      }

      // 惑星の色を追加
      const planetColors = [
        "gray",
        "blue",
        "green",
        "orange",
        "purple",
        "red",
        "orange-red",
        "blue-green",
        "pink",
        "yellow",
      ]
      quests.quests = quests.quests.map((quest: any, index: number) => ({
        ...quest,
        planet: planetColors[index % planetColors.length],
        completed: false,
        current: index === 0,
      }))

      return new Response(JSON.stringify(quests), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (innerError) {
      console.error("Error in AI processing:", innerError)

      // デモ用のサンプルデータを返す
      const sampleQuests = {
        quests: [
          {
            title: "アートセラピーの基礎理解",
            description: "アートセラピーとは何かを理解し、活動の土台を作る。",
            actions: [
              "書籍やオンライン資料を通じて「アートセラピー」の歴史や理論を調べる。",
              "メンタルケアや自己表現において、アートがどのような役割を果たすかを学ぶ。",
              "専門家や学校のカウンセラーにインタビューを申し込み、基礎知識や注意点を聞いてみる。",
            ],
            outcome: "アートセラピーに関するミニレポートやまとめスライド。",
            difficulty: 2,
            order: 1,
            planet: "gray",
            completed: false,
            current: true,
          },
          {
            title: "対象とゴールの設定",
            description: "どのような人をサポートしたいのか、そのためにどんな形のアートを活用したいのかを具体化する。",
            actions: [
              "「友人やクラスメイト向け」「地域の高齢者向け」「幼稚園児向け」など、支援したい層をイメージし、ニーズを考える。",
              "学校・地域・施設の協力を得られるか下調べし、アプローチ可能な場所を確認する。",
              "活用したいアートのジャンルを検討（絵画、粘土、音楽、演劇など）し、その理由や必要な準備をリストアップする。",
            ],
            outcome: "対象（ターゲット）とゴールを明文化した企画書の草案。",
            difficulty: 3,
            order: 2,
            planet: "orange",
            completed: false,
            current: false,
          },
          {
            title: "具体的アクティビティの設計",
            description: "実際に行う活動内容をプログラム化する。",
            actions: [
              "1回あたりのセッション内容（所要時間、使用する道具、手順、テーマ）を組み立てる。",
              "安全面やプライバシー、個人情報保護など、注意すべき項目を洗い出す。",
              "参加者がストレスなく取り組めるように、難易度や手順をできるだけシンプルに調整する。",
              "必要な物品をリストアップし、予算や購入先を検討する。",
            ],
            outcome: "アクティビティの進行プラン（タイムテーブル、役割分担、使用道具リストなど）。",
            difficulty: 4,
            order: 3,
            planet: "blue",
            completed: false,
            current: false,
          },
          {
            title: "実践（ワークショップまたは交流イベントの実施）",
            description: "実際にアートを用いたセラピー活動を開催してみる。",
            actions: [
              "学校や地域施設、オンラインなど、可能な形式で開催日を設定し、告知・募集を行う。",
              "当日、アクティビティを進行し、参加者の様子を見ながら臨機応変に調整する。",
              "アンケート用紙や簡易チェックリストを準備し、活動後の感想・満足度や気づきを収集する。",
            ],
            outcome: "ワークショップやイベントの実施写真・動画、参加者アンケートやフィードバックの記録",
            difficulty: 5,
            order: 4,
            planet: "orange-red",
            completed: false,
            current: false,
          },
          {
            title: "振り返りと発信",
            description: "プロジェクト全体を振り返り、学びや成果をまとめる。さらに今後の発展につなげる。",
            actions: [
              "アンケート結果や参加者の声を分析し、「アートセラピー」にどのような効果・インパクトがあったか検証する。",
              "自分自身が感じた成長や課題を整理し、次のステップ（さらなる企画や進学・将来プランとのつながり）を考える。",
              "SNSや校内新聞などで活動報告を行い、周りに共有する。必要があれば参加者や協力者へお礼のメッセージを送る。",
            ],
            outcome: "活動レポート、事後分析資料、今後のプラン提案書",
            difficulty: 4,
            order: 5,
            planet: "red",
            completed: false,
            current: false,
          },
          {
            title: "アート素材の探索と実験",
            description: "様々なアート素材や技法を試し、アートセラピーに適した表現方法を見つける。",
            actions: [
              "絵の具、粘土、コラージュ素材など、様々な素材を集め、それぞれの特性や効果を試す。",
              "自分自身で各素材を使った作品を作り、感情表現や自己発見につながるかを体験する。",
              "素材ごとの長所・短所、適した対象者、準備の手軽さなどを比較検討する。",
            ],
            outcome: "素材サンプル集と各素材の特性・効果をまとめたガイド。",
            difficulty: 1,
            order: 6,
            planet: "green",
            completed: false,
            current: false,
          },
          {
            title: "アートセラピーの効果測定方法の開発",
            description: "アートセラピー活動の効果を客観的に測定するための方法を考案する。",
            actions: [
              "既存の心理評価スケールや質問紙を調査し、アートセラピーの効果測定に適したものを選ぶ。",
              "参加者の変化を観察するためのチェックリストや記録シートを作成する。",
              "定性的・定量的データを組み合わせた評価方法を設計する。",
            ],
            outcome: "オリジナルの効果測定ツールキット（事前・事後アンケート、観察シートなど）。",
            difficulty: 4,
            order: 7,
            planet: "purple",
            completed: false,
            current: false,
          },
          {
            title: "小規模パイロットセッションの実施",
            description: "本格的なワークショップの前に、少人数の協力者を集めてパイロットセッションを行う。",
            actions: [
              "友人や家族など2〜3名の協力者を募り、試験的なセッションを実施する。",
              "計画したアクティビティの流れ、時間配分、指示の明確さなどを確認する。",
              "参加者からのフィードバックを集め、改善点を洗い出す。",
            ],
            outcome: "パイロットセッションの記録と改善点リスト。",
            difficulty: 3,
            order: 8,
            planet: "blue-green",
            completed: false,
            current: false,
          },
          {
            title: "アートセラピー活動の広報戦略",
            description: "ワークショップや活動を効果的に広報するための戦略を立てる。",
            actions: [
              "ターゲット層に適した広報チャネル（SNS、学校の掲示板、地域コミュニティなど）を特定する。",
              "魅力的なポスターやチラシ、SNS投稿用の画像を作成する。",
              "活動の意義や期待される効果を簡潔に伝えるキャッチコピーやメッセージを考案する。",
            ],
            outcome: "広報計画書と広報素材（ポスター、SNS投稿など）。",
            difficulty: 2,
            order: 9,
            planet: "pink",
            completed: false,
            current: false,
          },
          {
            title: "アートセラピー活動の持続可能な運営モデル",
            description: "一回限りではなく、継続的に活動を行うための運営モデルを構築する。",
            actions: [
              "必要な資源（場所、材料、人員、資金など）を洗い出し、調達方法を検討する。",
              "学校のクラブ活動、地域のボランティア団体、NPOなど、活動の枠組みを検討する。",
              "長期的な活動計画と成長戦略（参加者の拡大、活動内容の充実など）を立てる。",
            ],
            outcome: "持続可能な運営モデルの企画書（予算計画、組織体制、年間スケジュールなど）。",
            difficulty: 5,
            order: 10,
            planet: "yellow",
            completed: false,
            current: false,
          },
        ],
      }

      return new Response(JSON.stringify(sampleQuests), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error in quest generation API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
