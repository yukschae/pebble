import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(req: NextRequest) {
  const { quests } = await req.json()
  if (!Array.isArray(quests))
    return NextResponse.json({ error: "quests are required" }, { status: 400 })

  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined

  const supabase = token
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { global: { headers: { Authorization: `Bearer ${token}` } } },
      )
    : createRouteHandlerClient({ cookies })

  let userId: string | null = null
  if (token) {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } else {
    const { data } = await supabase.auth.getSession()
    userId = data.session?.user?.id ?? null
  }
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { error: delErr } = await supabase.from("quests").delete().eq("user_id", userId)
    if (delErr) throw delErr

    const questsWithUser = quests.map((q: any, idx: number) => {
      const sanitized = { ...q }
      delete sanitized.id
      return {
        ...sanitized,
        user_id: userId,
        order: idx,
        created_at: new Date().toISOString(),
      }
    })
    const { error } = await supabase.from("quests").insert(questsWithUser)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[save-quests] db error:", err)
    return NextResponse.json(
      { error: "Failed to save quests", details: (err as Error).message },
      { status: 500 },
    )
  }
}