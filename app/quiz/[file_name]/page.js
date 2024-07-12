// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import QuizComponent from "@/components/QuizComponent";

// export default async function QuizPage({ params }) {
//   const { file_name } = params;
//   const supabase = createServerComponentClient({ cookies });
  
//   console.log('Fetching quiz for file_name:', file_name);
  
//   // Fetch quiz questions from qtable
//   const { data: questions, error } = await supabase
//     .from('qtable')
//     .select('*')
//     .eq('file_name', decodeURIComponent(file_name));

//   if (error) {
//     console.error('Error fetching questions:', error);
//     return <div>Error loading quiz. Please try again later.</div>;
//   }

//   if (!questions || questions.length === 0) {
//     console.log('No questions found for file_name:', file_name);
//     return <div>No questions found for this quiz.</div>;
//   }

//   console.log('Questions found:', questions.length);

//   // Fetch the user's name or email
//   const { data: { user } } = await supabase.auth.getUser();
//   const testTaker = user?.user_metadata?.full_name || user?.email || "Test Taker";

//   return (
//     <div className="w-full">
//       <QuizComponent questions={questions} file_name={file_name} testTaker={testTaker} />
   
//     </div>
//   );
// // }

// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import QuizComponent from "@/components/QuizComponent";
// import Header from "@/components/Header";
// import Wall from '@/components/Wall';

// export default async function QuizPage({ params }) {
//   const { file_name } = params;
//   const supabase = createServerComponentClient({ cookies });
//   console.log('Fetching quiz for file_name:', file_name);

//   // Fetch quiz questions from qtable
//   const { data: questions, error } = await supabase
//     .from('qtable')
//     .select('*')
//     .eq('file_name', decodeURIComponent(file_name));

//   if (error) {
//     console.error('Error fetching questions:', error);
//     return <div>Error loading quiz. Please try again later.</div>;
//   }

//   if (!questions || questions.length === 0) {
//     console.log('No questions found for file_name:', file_name);
//     return <div>No questions found for this quiz.</div>;
//   }

//   console.log('Questions found:', questions.length);

//   // Fetch the user's name or email
//   const { data: { user } } = await supabase.auth.getUser();
//   const testTaker = user?.user_metadata?.full_name || "Test Taker";

//   // Fetch the user's subscription status
//   const { data: subscriptionData, error: subscriptionError } = await supabase
//     .from('subscribers')
//     .select('subscription_status, examname')
//     .eq('user_id', user.id)
//     .single();

//   if (subscriptionError) {
//     console.error('Error fetching subscription data:', subscriptionError);
//     return <div>Error loading subscription data. Please try again later.</div>;
//   }

//   return (
//     <Wall examName={subscriptionData.examname}>
//       <Header />
//       <div className="w-full">
//         <QuizComponent 
//           questions={questions} 
//           quizName={decodeURIComponent(file_name)} 
//           testTaker={testTaker}
//           isSelfExam={false}
//         />
//       </div>
//     </Wall>
//   );
// }

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import QuizComponent from "@/components/QuizComponent";
import Header from "@/components/Header";
import Wall from '@/components/Wall';
import { Suspense } from "react";

export default async function QuizPage({ params }) {
    const { file_name } = params;
    const supabase = createServerComponentClient({ cookies });
    console.log('Fetching quiz for file_name:', file_name);

    // Fetch quiz questions from qtable
    const { data: questions, error } = await supabase
        .from('qtable')
        .select('*')
        .eq('file_name', decodeURIComponent(file_name));

    if (error) {
        console.error('Error fetching questions:', error);
        return <div>Error loading quiz. Please try again later.</div>;
    }

    if (!questions || questions.length === 0) {
        console.log('No questions found for file_name:', file_name);
        return <div>No questions found for this quiz.</div>;
    }

    console.log('Questions found:', questions.length);

    // Fetch the user's name or email
    const { data: { user } } = await supabase.auth.getUser();
    const testTaker = user?.user_metadata?.full_name || "Test Taker";

    // Fetch the user's subscription status
    const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('subscribers')
        .select('subscription_status, examname')
        .eq('user_id', user.id)
        .single();

    if (subscriptionError) {
        console.error('Error fetching subscription data:', subscriptionError);
        return <div>Error loading subscription data. Please try again later.</div>;
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Wall examName={subscriptionData.examname}>
                <Header />
                <div className="w-full">
                    <QuizComponent 
                        questions={questions} 
                        quizName={decodeURIComponent(file_name)} 
                        testTaker={testTaker}
                        isSelfExam={false}
                    />
                </div>
            </Wall>
        </Suspense>
    );
}
