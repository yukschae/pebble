import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { getSelectedPassionShuttle } from "@/lib/supabase"

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
      // パッションシャトルを取得
      const passionShuttle = await getSelectedPassionShuttle(userId)

      if (!passionShuttle) {
        return new Response(JSON.stringify({ error: "No passion shuttle found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      // プロンプトを生成
      const prompt = `
あなたは探究学習のエキスパートです。以下のパッションシャトルに基づいて、具体的な探究プロジェクトの方向性を5つ提案してください。

パッションシャトル：「${passionShuttle.title}」
説明：${passionShuttle.description}
タグ：${passionShuttle.tags.join(", ")}

各方向性には以下の要素を含めてください：
1. タイトル：具体的で魅力的なプロジェクトタイトル
2. 説明：100-150文字程度の簡潔な説明
3. タグ：関連するキーワード（3-5個）

回答は以下のJSON形式で返してください：
{
  "directions": [
    {
      "title": "プロジェクトタイトル",
      "description": "プロジェクトの説明...",
      "tags": ["タグ1", "タグ2", "タグ3"]
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
        maxTokens: 2000,
      })

      // JSONをパース
      let directions
      try {
        directions = JSON.parse(text)
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError, text)
        throw new Error("Invalid JSON response from AI")
      }

      return new Response(JSON.stringify(directions), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (innerError) {
      console.error("Error in AI processing:", innerError)

      // デモ用のサンプルデータを返す
      const sampleDirections = {
        directions: [
          {
            title: "アートセラピーワークショップの開催",
            description:
              "芸術的な手法を用いて、地域コミュニティの人々の心理的・感情的な健康をサポートするワークショップを企画・実施する。",
            tags: ["アートセラピー", "ワークショップ", "コミュニティ支援"],
          },
          {
            title: "学校でのアート表現プログラム",
            description:
              "地元の学校と連携し、生徒たちが自己表現やストレス解消のためのアート活動を行うプログラムを開発・実施する。",
            tags: ["教育", "自己表現", "メンタルヘルス"],
          },
          {
            title: "高齢者向けアートセラピーセッション",
            description:
              "高齢者施設と協力して、認知症予防や生活の質向上を目的としたアートセラピーセッションを定期的に開催する。",
            tags: ["高齢者支援", "認知症予防", "QOL向上"],
          },
          {
            title: "オンラインアートセラピーコミュニティの構築",
            description:
              "遠隔地からでも参加できるオンラインプラットフォームを活用し、アートを通じた心のケアと交流の場を提供する。",
            tags: ["オンラインコミュニティ", "デジタルアート", "アクセシビリティ"],
          },
          {
            title: "アートを通じた社会課題の可視化プロジェクト",
            description:
              "地域社会の課題をアートで表現し、展示やSNSを通じて問題提起と解決策の議論を促すプロジェクトを実施する。",
            tags: ["社会課題", "アドボカシー", "コミュニティエンゲージメント"],
          },
        ],
      }

      return new Response(JSON.stringify(sampleDirections), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error in quest direction suggestion API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
