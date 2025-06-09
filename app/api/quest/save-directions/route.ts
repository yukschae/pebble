import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(req: NextRequest) {
  const { direction } = await req.json()
  if (!direction)
    return NextResponse.json({ error: "direction is required" }, { status: 400 })

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
    await supabase
      .from("quest_directions")
      .update({ selected: false })
      .eq("user_id", userId)

    const focusAreas = Array.isArray(direction.tags)
      ? direction.tags
      : Array.isArray(direction.focus_areas)
        ? direction.focus_areas
        : typeof direction.tags === "string"
          ? direction.tags.split(/[,\s]+/).filter(Boolean)
          : []

    await supabase.from("quest_directions").insert({
      user_id: userId,
      title: direction.title,
      description: direction.description,
      focus_areas: focusAreas,
      selected: true,
      created_at: new Date().toISOString(),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[save-direction] db error:", err)
    return NextResponse.json(
      { error: "Failed to save quest direction", details: (err as Error).message },
      { status: 500 },
    )
  }
}