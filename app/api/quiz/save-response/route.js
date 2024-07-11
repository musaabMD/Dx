import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { question_id, user_answer, ...clicked } = body;

  if (!question_id || !user_answer) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Save the user's response
    const { error } = await supabase.from("user_responses").upsert({
      user_id: user.id,
      question_id,
      user_answer,
      ...clicked,
    });

    if (error) throw error;

    return NextResponse.json({ message: "Response saved successfully" });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}