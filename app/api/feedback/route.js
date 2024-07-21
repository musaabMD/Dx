// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   const supabase = createRouteHandlerClient({ cookies });

//   try {
//     const { questionId, feedbackType, suggestedAnswer, feedbackText } = await req.json();
//     console.log('Received feedback:', { questionId, feedbackType, suggestedAnswer, feedbackText });

//     // Fetch question details
//     const { data: questionData, error: questionError } = await supabase
//       .from("qtable")
//       .select("question_text")
//       .eq("id", questionId)
//       .single();

//     if (questionError) {
//       console.error('Error fetching question:', questionError);
//       return NextResponse.json({ error: 'Failed to fetch question details' }, { status: 400 });
//     }

//     if (!questionData) {
//       console.error('Question not found:', questionId);
//       return NextResponse.json({ error: 'Question not found' }, { status: 404 });
//     }

//     // Get the current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();

//     if (userError) {
//       console.error('Error getting user:', userError);
//       return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
//     }

//     // Construct feedback data
//     const feedbackData = {
//       question_id: questionId,
//       feedback_type: feedbackType,
//       suggested_answer: suggestedAnswer || null,
//       feedback_text: feedbackText,
//       user_id: user.id
//     };

//     // Insert feedback into Supabase
//     const { data: feedbackInsertResult, error: feedbackInsertError } = await supabase
//       .from("feedback")
//       .insert(feedbackData)
//       .select();

//     if (feedbackInsertError) {
//       console.error('Supabase error inserting feedback:', feedbackInsertError);
//       return NextResponse.json({ error: 'Failed to insert feedback' }, { status: 500 });
//     }

//     console.log('Feedback inserted successfully:', feedbackInsertResult);
//     return NextResponse.json({ message: 'Feedback submitted successfully', data: feedbackInsertResult });
//   } catch (error) {
//     console.error('Server error handling feedback:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
// }import { NextResponse } from "next/server"import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   const supabase = createRouteHandlerClient({ cookies });

//   try {
//     const { question_id, feedback_type, suggested_answer, feedback_text } = await req.json();
//     console.log('Received feedback:', { question_id, feedback_type, suggested_answer, feedback_text });

//     if (!question_id || !feedback_type || !feedback_text) {
//       console.error('Missing required fields:', { question_id, feedback_type, feedback_text });
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Fetch question details
//     const { data: questionData, error: questionError } = await supabase
//       .from("qtable")
//       .select("question_text")
//       .eq("id", question_id)
//       .single();

//     console.log('Question Data:', questionData);
//     console.log('Question Error:', questionError);

//     if (questionError) {
//       console.error('Error fetching question:', questionError);
//       return NextResponse.json({ error: 'Failed to fetch question details' }, { status: 400 });
//     }

//     if (!questionData) {
//       console.error('Question not found:', question_id);
//       return NextResponse.json({ error: 'Question not found' }, { status: 404 });
//     }

//     // Get the current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();

//     if (userError) {
//       console.error('Error getting user:', userError);
//       return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
//     }

//     // Construct feedback data
//     const feedbackData = {
//       question_id,
//       feedback_type,
//       suggested_answer: suggested_answer || null,
//       feedback_text,
//       user_id: user.id,
//       status: 'In Progress'
//     };

//     // Insert feedback into Supabase
//     const { data: feedbackInsertResult, error: feedbackInsertError } = await supabase
//       .from("feedback")
//       .insert(feedbackData)
//       .select();

//     if (feedbackInsertError) {
//       console.error('Supabase error inserting feedback:', feedbackInsertError);
//       return NextResponse.json({ error: 'Failed to insert feedback' }, { status: 500 });
//     }

//     console.log('Feedback inserted successfully:', feedbackInsertResult);
//     return NextResponse.json({ message: 'Feedback submitted successfully', data: feedbackInsertResult });
//   } catch (error) {
//     console.error('Server error handling feedback:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// // }
// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   const supabase = createRouteHandlerClient({ cookies });

//   try {
//     const { question_id, exam_name, feedback_type, suggested_answer, feedback_text } = await req.json();
//     console.log('Received feedback:', { question_id, exam_name, feedback_type, suggested_answer, feedback_text });

//     if (!question_id || !exam_name || !feedback_type || !feedback_text) {
//       console.error('Missing required fields:', { question_id, exam_name, feedback_type, feedback_text });
//       return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
//     }

//     // Fetch question details
//     const { data: questionData, error: questionError } = await supabase
//       .from("qtable")
//       .select("question_text")
//       .eq("id", question_id)
//       .single();

//     if (questionError) {
//       console.error('Error fetching question:', questionError);
//       return NextResponse.json({ error: 'Failed to fetch question details' }, { status: 400 });
//     }

//     if (!questionData) {
//       console.error('Question not found:', question_id);
//       return NextResponse.json({ error: 'Question not found' }, { status: 404 });
//     }

//     // Get the current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();

//     if (userError) {
//       console.error('Error getting user:', userError);
//       return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
//     }

//     // Construct feedback data
//     const feedbackData = {
//       question_id,
//       exam_name,
//       feedback_type,
//       suggested_answer: suggested_answer || null,
//       feedback_text,
//       user_id: user.id,
//       status: 'In Progress'
//     };

//     // Insert feedback into Supabase
//     const { data: feedbackInsertResult, error: feedbackInsertError } = await supabase
//       .from("feedback")
//       .insert(feedbackData)
//       .select();

//     if (feedbackInsertError) {
//       console.error('Supabase error inserting feedback:', feedbackInsertError);
//       return NextResponse.json({ error: 'Failed to insert feedback' }, { status: 500 });
//     }

//     console.log('Feedback inserted successfully:', feedbackInsertResult);
//     return NextResponse.json({ message: 'Feedback submitted successfully', data: feedbackInsertResult });
//   } catch (error) {
//     console.error('Server error handling feedback:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// // }
// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   const supabase = createRouteHandlerClient({ cookies });

//   try {
//     const { questionId, examName, feedbackType, suggestedAnswer, feedbackText } = await req.json();
//     console.log('Received feedback:', { questionId, examName, feedbackType, suggestedAnswer, feedbackText });

//     // Get the current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError) {
//       console.error('Error getting user:', userError);
//       return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
//     }

//     // Construct feedback data
//     const feedbackData = {
//       question_id: questionId,
//       exam_name: examName || 'Unknown', // Provide a default value if examName is undefined
//       feedback_type: feedbackType,
//       suggested_answer: suggestedAnswer,
//       feedback_text: feedbackText,
//       user_id: user.id,
//       status: 'In Progress'
//     };

//     // Insert feedback into Supabase
//     const { data: feedbackInsertResult, error: feedbackInsertError } = await supabase
//       .from("feedback")
//       .insert(feedbackData)
//       .select();

//     if (feedbackInsertError) {
//       console.error('Supabase error inserting feedback:', feedbackInsertError);
//       return NextResponse.json({ error: 'Failed to insert feedback' }, { status: 500 });
//     }

//     console.log('Feedback inserted successfully:', feedbackInsertResult);
//     return NextResponse.json({ message: 'Feedback submitted successfully', data: feedbackInsertResult[0] });

//   } catch (error) {
//     console.error('Server error handling feedback:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// // }
// import { NextResponse } from "next/server";
// import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";

// export const dynamic = "force-dynamic";

// export async function POST(req) {
//   const supabase = createRouteHandlerClient({ cookies });
  
//   try {
//     const body = await req.json();
//     console.log('Raw request body:', body);

//     const { questionId, examName, feedbackType, suggestedAnswer, feedbackText } = body;
//     console.log('Parsed feedback data:', { questionId, examName, feedbackType, suggestedAnswer, feedbackText });

//     // Get the current user
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError) {
//       console.error('Error getting user:', userError);
//       return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
//     }

//     // Construct feedback data
//     const feedbackData = {
//       question_id: questionId,
//       exam_name: examName || 'Unknown', // Provide a default value if examName is undefined
//       feedback_type: feedbackType,
//       suggested_answer: suggestedAnswer,
//       feedback_text: feedbackText,
//       user_id: user.id,
//       status: 'In Progress'
//     };

//     console.log('Feedback data to be inserted:', feedbackData);

//     // Insert feedback into Supabase
//     const { data: feedbackInsertResult, error: feedbackInsertError } = await supabase
//       .from("feedback")
//       .insert(feedbackData)
//       .select();

//     if (feedbackInsertError) {
//       console.error('Supabase error inserting feedback:', feedbackInsertError);
//       return NextResponse.json({ error: 'Failed to insert feedback' }, { status: 500 });
//     }

//     console.log('Feedback inserted successfully:', feedbackInsertResult);
//     return NextResponse.json({ message: 'Feedback submitted successfully', data: feedbackInsertResult[0] });

//   } catch (error) {
//     console.error('Server error handling feedback:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }
import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const body = await req.json();
    console.log('Raw request body:', body);

    const { questionId, examName, feedbackType, suggestedAnswer, feedbackText } = body;
    console.log('Parsed feedback data:', { questionId, examName, feedbackType, suggestedAnswer, feedbackText });

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError);
      return NextResponse.json({ error: 'Failed to get user' }, { status: 401 });
    }

    // Construct feedback data
    const feedbackData = {
      question_id: questionId,
      exam_name: examName || 'Unknown', // Provide a default value if examName is undefined
      feedback_type: feedbackType,
      suggested_answer: suggestedAnswer,
      feedback_text: feedbackText,
      user_id: user.id,
      status: 'In Progress'
    };

    console.log('Feedback data to be inserted:', feedbackData);

    // Insert feedback into Supabase
    const { data: feedbackInsertResult, error: feedbackInsertError } = await supabase
      .from("feedback")
      .insert(feedbackData)
      .select();

    if (feedbackInsertError) {
      console.error('Supabase error inserting feedback:', feedbackInsertError);
      return NextResponse.json({ error: 'Failed to insert feedback' }, { status: 500 });
    }

    console.log('Feedback inserted successfully:', feedbackInsertResult);
    return NextResponse.json({ message: 'Feedback submitted successfully', data: feedbackInsertResult[0] });

  } catch (error) {
    console.error('Server error handling feedback:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
