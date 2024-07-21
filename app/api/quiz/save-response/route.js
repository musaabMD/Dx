// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   const body = await req.json();
//   const { question_id, user_answer, ...clicked } = body;

//   if (!question_id || !user_answer) {
//     return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//   }

//   try {
//     const supabase = createRouteHandlerClient({ cookies });
    
//     // Get the current user's ID
//     const { data: { user } } = await supabase.auth.getUser();

//     if (!user) {
//       return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
//     }

//     // Save the user's response
//     const { error } = await supabase.from("user_responses").upsert({
//       user_id: user.id,
//       question_id,
//       user_answer,
//       ...clicked,
//     });

//     if (error) throw error;

//     return NextResponse.json({ message: "Response saved successfully" });
//   } catch (error) {
//     console.error('Error saving response:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

// import { cookies } from "next/headers";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const { question_id, user_answer, ...clicked } = body;

//     if (!question_id || !user_answer) {
//       return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
//     }

//     const supabase = createRouteHandlerClient({ cookies });

//     // Get the current user's ID
//     const { data: { user }, error: userError } = await supabase.auth.getUser();

//     if (userError || !user) {
//       return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
//     }

//     // Save the user's response
//     const { data, error } = await supabase.from("user_responses").upsert({
//       user_id: user.id,
//       question_id,
//       user_answer,
//       ...clicked,
//     });

//     if (error) throw error;

//     return NextResponse.json({ message: "Response saved successfully" });
//   } catch (error) {
//     console.error('Error saving response:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    console.log('Request received:', body);
    const { question_id, user_answer, is_bookmarked, a_clicked, b_clicked, c_clicked, d_clicked, e_clicked, f_clicked } = body;

    if (!question_id || !user_answer) {
      console.log('Missing required fields');
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createRouteHandlerClient({ cookies });

    // Get the current user's session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error retrieving session:', sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    if (!session) {
      console.log('User not authenticated');
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    const user = session.user;

    // Save the user's response
    const { error } = await supabase.from("user_responses").upsert({
      user_id: user.id,
      question_id,
      user_answer,
      is_bookmarked,
      a_clicked,
      b_clicked,
      c_clicked,
      d_clicked,
      e_clicked,
      f_clicked,
    });

    if (error) throw error;

    console.log('Response saved successfully');
    return NextResponse.json({ message: "Response saved successfully" }, { status: 200 });
  } catch (error) {
    console.error('Error saving response:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
