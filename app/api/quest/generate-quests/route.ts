import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
import { getSelectedQuestDirection } from "@/lib/server-superbase"
import { parseJsonSafe } from "@/lib/utils"

export const maxDuration = 60

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
    const { userId, existingQuests, count } = await req.json()
    const missingCount =
      typeof count === "number"
        ? count
        : Math.max(0, 5 - (Array.isArray(existingQuests) ? existingQuests.length : 0))

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

      const existing = Array.isArray(existingQuests) && existingQuests.length > 0
        ? `\n既に設定済みのクエスト:\n${existingQuests
            .map((q: any, i: number) => `${i + 1}. ${q.title}: ${q.description}`)
            .join("\n")}`
        : ""

      // プロンプトを生成
      const prompt = `あなたは探究学習のエキスパートです。以下のクエスト方向性に基づいて、残り${missingCount}個の探究クエストのみを日本語で提案してください。${existing}
クエスト方向性：「${qd.title}」
説明：${qd.description}
タグ：${tags.join(", ")}

各クエストには以下の要素を含めてください：
1. タイトル
2. 説明（100-150文字）
3. 行動例（3-4個）
4. 成果物
5. 難易度（1〜5）
6. 順序（1〜5）

既に設定済みのクエストは変更せず、内容が重複しないようにしてください。
回答は高校生がわかりやすく理解できるよう、漢字の熟語や専門用語は多用しないでください。

回答はJSONのみで以下の形式:
{"quests": [ {"title": "..."}, {"description": "..."}, {"actions": "..."}, {"outcome": "..."}, {"difficulty": "..."}, {"order": "..."}, ]}
`

      // AI SDKを使用してテキストを生成
      const { text } = await generateText({
        model: anthropic("claude-sonnet-4-20250514"),
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
