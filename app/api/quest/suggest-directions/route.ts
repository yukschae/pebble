import {
  getSelectedPassionShuttle,
  getUserOceanResults,
  getUserRiasecResults,
} from "@/lib/server-superbase"
import { parseJsonSafe } from "@/lib/utils"

const anthropicHeaders = (key: string) => ({
  "Content-Type": "application/json",
  "x-api-key": key,
  "anthropic-version": "2023-06-01",
})


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

    // リクエストボディを取得
    
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: "User ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      // パッションシャトルを取得
      const [oceanData, riasecData, passionShuttle] = await Promise.all([
        getUserOceanResults(userId, token),
        getUserRiasecResults(userId, token),
        getSelectedPassionShuttle(userId, token),
      ])

      if (!oceanData || !riasecData) {
        return new Response(
          JSON.stringify({ error: "Missing OCEAN or RIASEC results" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        )
      }

      if (!passionShuttle) {
        return new Response(JSON.stringify({ error: "No passion shuttle found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        })
      }

      const oceanStr = JSON.stringify(oceanData.results, null, 2)
      const riasecStr = JSON.stringify(riasecData.results, null, 2)
      const passionStr = JSON.stringify(
        {
          title: passionShuttle.title,
          informative_description: passionShuttle.informative_description,
          tags: passionShuttle.tags,
        },
        null,
        2,
      )

      // プロンプトを生成
      const prompt = `あなたは高校生向けの探究学習AIアドバイザーです。生徒の興味関心と社会貢献を結びつけた、ワクワクするような探究プロジェクトの方向性を提案することが目的です。

まず、生徒の情報を確認してください：

<user_ocean>
${oceanStr}
</user_ocean>

次に、生徒のRIASECタイプの情報を確認してください：

<user_riasec>
${riasecStr}
</user_riasec>

最後に、パッションシャトルを確認してください：

<passion_shuttle>
${passionStr}
</passion_shuttle>

これらの情報を基に、以下の手順で5つの探究プロジェクトの方向性を提案してください：

1. 生徒の特性とパッションシャトルの内容を結びつけ、ワクワクするようなプロジェクトのアイデアを考えてください。
2. 各プロジェクトについて、以下の要素を含めてください：
   a. タイトル：高校生がワクワクするような、具体的でキャッチーなプロジェクト名（10語以内）
   b. 説明（120文字以内）：
      - プロジェクトの内容（何をするのか）
      - ワクワクポイント（どこが楽しそうか）
      - 貢献ポイント（どんな人や社会の役に立つか）
      - パーソナルポイント（なぜこの生徒に合っているか）
   c. キーワード：3分間の簡単なリサーチに使える、短くて直感的な単語を4つ

3. 高校生にとってわかりやすく、イメージが湧きやすい表現を心がけてください。敬語ではなくタメ口にしてください。
4. 専門用語や難しい言葉は避け、漢字の熟語を多用しないことを意識し、親しみやすい言葉で説明してください。
5. 各プロジェクトが生徒の特性（OCEAN、RIASEC）とどう関連しているかを考慮してください。

まず、<project_ideation>タグ内でアイデアを練ってください：

1. 生徒の特性とパッションシャトルの内容に基づいて、10個の初期プロジェクトアイデアを挙げてください。
2. 各アイデアをOCEAN、RIASEC、パッションシャトルの基準に照らし合わせて評価し、10点満点で採点してください。
3. 採点結果に基づいて、上位5つのアイデアを選択してください。
4. 選択された各アイデアについて、プロジェクトの要素（タイトル、説明、キーワード）の概要を作成してください。

その後、最終的な提案をJSON形式で出力してください。

出力例（イメージ）：
{
  "directions": [
    {"title": "伝統のワザを世界に発信！SNSで魅力を伝えよう",
      "description": "地元の伝統工芸のすごさを動画で紹介し、世界中に広めるチャレンジ！職人さんにインタビューしたり、製作風景を撮影して、英語字幕付きでTikTokやInstagramに投稿しよう。動画編集や発信が好きなあなたにぴったり。文化の魅力を伝える楽しさと、喜んでもらえる感動が味わえるよ！",
      "keywords": ["伝統工芸", "TikTok活用", "日本文化", "職人ストーリー"]
    }
    // ... 合計5つのプロジェクト
  ]
}

それでは、生徒のための魅力的な探究プロジェクトの方向性を提案してください。`

        // Anthropic API を直接呼び出してテキストを生成
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: anthropicHeaders(process.env.ANTHROPIC_API_KEY!),
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 3000,
          }),
      })

      const aiJson = await aiRes.json()
      const text = aiJson.content?.[0]?.text ?? ""

      let directions
      try {
        directions = parseJsonSafe(text)
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
          error: "Failed to generate quest directions",
          details: innerError instanceof Error ? innerError.message : String(innerError),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
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
