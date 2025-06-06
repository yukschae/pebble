import { anthropic } from "@ai-sdk/anthropic"
import { generateText } from "ai"
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

    // リクエストボディを取得
    const { quests, minDifficulty, maxDifficulty } = await req.json()

    if (!quests || minDifficulty === undefined || maxDifficulty === undefined) {
      return new Response(JSON.stringify({ error: "Quests and difficulty range are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      // 難易度でフィルタリング
      let filteredQuests = quests.filter(
        (quest: any) => quest.difficulty >= minDifficulty && quest.difficulty <= maxDifficulty,
      )

      // 5個以下の場合はそのまま返す
      if (filteredQuests.length <= 5) {
        // 順序を1から振り直す
        filteredQuests = filteredQuests.map((quest: any, index: number) => ({
          ...quest,
          order: index + 1,
          current: index === 0,
          completed: false,
        }))

        return new Response(JSON.stringify({ quests: filteredQuests }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }

      // 5個以上の場合はAIで選別
      const prompt = `
あなたは探究学習のエキスパートです。以下のクエスト一覧から、最も適切な5つのクエストを選んでください。
選ぶ際は以下の点を考慮してください：
1. 難易度の分布（簡単なものから難しいものへの段階的な進行）
2. 内容の多様性（異なるスキルや知識を身につけられるように）
3. 論理的な順序（前のクエストが次のクエストの準備になるように）

クエスト一覧：
${JSON.stringify(filteredQuests, null, 2)}

回答は以下のJSON形式で返してください：
{
  "quests": [選んだ5つのクエスト]
}

選んだクエストには、order属性を1から5まで振り直し、current属性を最初のクエストのみtrueに、completed属性をすべてfalseに設定してください。

JSONのみを返してください。説明や前置きは不要です。
`

      // AI SDKを使用してテキストを生成
      const { text } = await generateText({
        model: anthropic("claude-3-haiku-20240307"),
        prompt: prompt,
        temperature: 0.3,
        maxTokens: 2000,
      })

      // JSONをパース
      let selectedQuests
      try {
        selectedQuests = parseJsonSafe(text)
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError, text)
        throw new Error("Invalid JSON response from AI")
      }

      return new Response(JSON.stringify(selectedQuests), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    } catch (innerError) {
      console.error("Error in AI processing:", innerError)

      // 手動でフィルタリングして5個選ぶ
      const filteredQuests = quests
        .filter((quest: any) => quest.difficulty >= minDifficulty && quest.difficulty <= maxDifficulty)
        .sort((a: any, b: any) => a.difficulty - b.difficulty)
        .slice(0, 5)
        .map((quest: any, index: number) => ({
          ...quest,
          order: index + 1,
          current: index === 0,
          completed: false,
        }))

      return new Response(JSON.stringify({ quests: filteredQuests }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }
  } catch (error) {
    console.error("Error in quest filtering API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
