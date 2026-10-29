import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(request: Request) {
  try {
    const { title, prompt } = await request.json();

    if (!title || !prompt) {
      return NextResponse.json({ error: "Title and prompt are required." }, { status: 400 });
    }

    if (title.trim().length > 80) {
      return NextResponse.json({ error: "Title is too long." }, { status: 400 });
    }

    if (prompt.trim().length > 600) {
      return NextResponse.json({ error: "Prompt is too long." }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a game designer. Return valid JSON only. Build a short, browser-playable game concept with one of these types: quiz, challenge, or memory. Return { title, description, objective, gameType, content }.",
        },
        {
          role: "user",
          content: `
            Game title: ${title}
            User request: ${prompt}
            JSON format:
            {
              "title": "Nebula Runner",
              "description": "A neon chase across a dead star lane.",
              "objective": "Collect crystals and reach the portal.",
              "gameType": "challenge",
              "content": {
                "steps": ["Collect 3 crystals", "Avoid the storm", "Reach the portal"],
                "target": 3
              }
            }
          `,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json({ error: "OpenAI returned no content." }, { status: 500 });
    }

    const json = JSON.parse(raw);

    if (!json.title || !json.description || !json.objective || !json.gameType) {
      return NextResponse.json({ error: "AI response missing required fields." }, { status: 500 });
    }

    return NextResponse.json(json);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
  }
}
