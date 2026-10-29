import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();

    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: "Could not load games" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createSupabaseServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      prompt,
      visibility,
      gameType,
      objective,
      content,
    } = body;

    if (!title || !description || !prompt || !visibility) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const allowedVisibility = ["public", "private"];
    const allowedTypes = ["quiz", "challenge", "memory"];

    if (!allowedVisibility.includes(visibility)) {
      return NextResponse.json({ error: "Invalid visibility" }, { status: 400 });
    }

    if (gameType && !allowedTypes.includes(gameType)) {
      return NextResponse.json({ error: "Invalid game type" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("games")
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim(),
        prompt: prompt.trim(),
        visibility,
        game_type: gameType || "quiz",
        objective: objective || "Complete the challenge.",
        content: content || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Could not save game" }, { status: 500 });
  }
}
