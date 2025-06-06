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
    const { userId, feedback, currentDirections } = await req.json()

    if (!userId || !feedback || !currentDirections) {
      return new Response(JSON.stringify({ error: "User ID, feedback, and current directions are required" }), {
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
あなたは探究学習のエキスパートです。以下のパッションシャトルと現在の方向性提案に基づいて、ユーザーのフィードバックを反映した新しい方向性を5つ提案してください。

パッションシャトル：「${passionShuttle.title}」
説明：${passionShuttle.description}
タグ：${passionShuttle.tags.join(", ")}

現在の方向性提案：
${JSON.stringify(currentDirections, null, 2)}

ユーザーからのフィードバック：
${feedback}

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
      return new Response(
        JSON.stringify({
          error: "Failed to refine quest directions",
          details: innerError instanceof Error ? innerError.message : String(innerError),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("Error in quest direction refinement API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
