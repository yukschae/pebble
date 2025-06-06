import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { getSelectedQuestDirection } from "@/lib/server-superbase"
import { parseJsonSafe } from "@/lib/utils"

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

    const token = req.headers.get("authorization")?.replace("Bearer ", "")
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
      const questDirection = await getSelectedQuestDirection(userId, token)

      if (!questDirection) {
        return new Response(JSON.stringify({ error: "No quest direction found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      const qd = questDirection as any
      const tags = Array.isArray(qd.tags)
        ? qd.tags
        : Array.isArray(qd.focus_areas)
          ? qd.focus_areas
          : []

      // プロンプトを生成
      
      const prompt = `
あなたは探究学習のエキスパートです。以下のクエスト方向性に基づいて、様々な難易度の探究クエストを10個提案してください。言語は日本語です。

クエスト方向性：「${qd.title}」
説明：${qd.description}
タグ：${tags.join(", ")}

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
        quests = parseJsonSafe(text)
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

      return new Response(
        JSON.stringify({
          error: "Failed to generate quests",
          details: innerError instanceof Error ? innerError.message : String(innerError),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
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
