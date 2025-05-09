import { savePassionShuttle } from "@/lib/supabase"

export async function POST(req: Request) {
  try {
    // リクエストボディを取得
    const { userId, title, description, tags } = await req.json()

    if (!userId || !title || !description || !tags) {
      return new Response(JSON.stringify({ error: "User ID, title, description, and tags are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // パッションシャトルを保存
    await savePassionShuttle(userId, title, description, tags)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error in passion shuttle save API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
