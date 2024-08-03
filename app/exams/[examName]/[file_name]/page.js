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

// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import QuizComponent from "@/components/QuizComponent";
// import Header from "@/components/Header";
// import Wall from '@/components/Wall';
// import { Suspense } from "react";

// export default async function QuizPage({ params }) {
//     const { file_name } = params;
//     const supabase = createServerComponentClient({ cookies });
//     console.log('Fetching quiz for file_name:', file_name);

//     // Fetch quiz questions from qtable
//     const { data: questions, error } = await supabase
//         .from('qtable')
//         .select('*')
//         .eq('file_name', decodeURIComponent(file_name));

//     if (error) {
//         console.error('Error fetching questions:', error);
//         return <div>Error loading quiz. Please try again later.</div>;
//     }

//     if (!questions || questions.length === 0) {
//         console.log('No questions found for file_name:', file_name);
//         return <div>No questions found for this quiz.</div>;
//     }

//     console.log('Questions found:', questions.length);

//     // Fetch the user's name or email
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     if (userError) {
//         console.error('Error fetching user:', userError);
//         return <div>Error loading user data. Please try again later.</div>;
//     }
//     const testTaker = user?.user_metadata?.full_name || "Test Taker";

//     // Fetch the user's subscription status
//     const { data: subscriptionData, error: subscriptionError } = await supabase
//         .from('subscribers')
//         .select('subscription_status, examname')
//         .eq('user_id', user.id)
//         .single();

//     if (subscriptionError) {
//         console.error('Error fetching subscription data:', subscriptionError);
//         return <div>Error loading subscription data. Please try again later.</div>;
//     }

//     return (
//         <Suspense fallback={<div>Loading...</div>}>
//             <Wall examName={subscriptionData.examname}>
//                 <div className="w-full">
//                     <QuizComponent 
//                         questions={questions} 
//                         quizName={decodeURIComponent(file_name)} 
//                         testTaker={testTaker}
//                         isSelfExam={false}
//                     />
//                 </div>
//             </Wall>
//         </Suspense>
//     );
// }

// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import QuizComponent from "@/components/QuizComponent";
// import Header from "@/components/Header";
// import Wall from '@/components/Wall';
// import { Suspense } from "react";

// export default async function QuizPage({ params }) {
//     const { examname } = params; // Ensure params has the correct key
//     const supabase = createServerComponentClient({ cookies });
//     console.log('Fetching quiz for examname:', examname);

//     // Fetch quiz questions from qs by examname
//     const { data: questions, error } = await supabase
//         .from('qs')
//         .select('*')
//         .eq('examname', decodeURIComponent(examname));

//     console.log('Fetched questions:', questions); // Debugging line
//     console.log('Questions fetch error:', error); // Debugging line

//     if (error) {
//         console.error('Error fetching questions:', error);
//         return <div>Error loading quiz. Please try again later.</div>;
//     }

//     if (!questions || questions.length === 0) {
//         console.log('No questions found for examname:', examname);
//         return <div>No questions found for this quiz.</div>;
//     }

//     console.log('Questions found:', questions.length);

//     // Fetch the user's name or email
//     const { data: { user }, error: userError } = await supabase.auth.getUser();
//     console.log('Fetched user:', user); // Debugging line
//     console.log('User fetch error:', userError); // Debugging line

//     if (userError) {
//         console.error('Error fetching user:', userError);
//         return <div>Error loading user data. Please try again later.</div>;
//     }
//     const testTaker = user?.user_metadata?.full_name || "Test Taker";

//     // Fetch the user's subscription status
//     const { data: subscriptionData, error: subscriptionError } = await supabase
//         .from('subscribers')
//         .select('subscription_status, examname')
//         .eq('user_id', user.id)
//         .single();

//     console.log('Fetched subscription data:', subscriptionData); // Debugging line
//     console.log('Subscription fetch error:', subscriptionError); // Debugging line

//     if (subscriptionError) {
//         console.error('Error fetching subscription data:', subscriptionError);
//         return <div>Error loading subscription data. Please try again later.</div>;
//     }

//     if (subscriptionData.subscription_status !== 'active') {
//         return (
//             <div>
//                 <Header />
//                 <div className="container mx-auto p-4">
//                     <h1 className="text-3xl font-bold mb-4">Subscription Required</h1>
//                     <p>You need an active subscription to access this quiz. Please subscribe to continue.</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <Suspense fallback={<div>Loading...</div>}>
//             <Wall examName={subscriptionData.examname}>
//                 <div className="w-full">
//                     <QuizComponent 
//                         questions={questions} 
//                         quizName={decodeURIComponent(examname)} 
//                         testTaker={testTaker}
//                         isSelfExam={false}
//                     />
//                 </div>
//             </Wall>
//         </Suspense>
//     );
// // }
// "use client";

// import React, { useEffect, useState } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import QuizComponent from '@/components/QuizComponent';

// const QuizPage = ({ params }) => {
//   const { examName, file_name } = params;
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [testTaker, setTestTaker] = useState(null);

//   const fetchQuestions = async () => {
//     const supabase = createClientComponentClient();
//     try {
//       const decodedExamName = decodeURIComponent(examName);
//       const decodedFileName = decodeURIComponent(file_name);
//       let allQuestions = [];
//       let rangeStart = 0;
//       const rangeStep = 1000;
//       let newQuestions = [];

//       do {
//         const { data, error } = await supabase
//           .from('qs')
//           .select('*')
//           .eq('file_name', decodedFileName)
//           .eq('examname', decodedExamName)
//           .range(rangeStart, rangeStart + rangeStep - 1);

//         if (error) {
//           throw new Error('Error fetching questions');
//         }

//         newQuestions = data;
//         allQuestions = [...allQuestions, ...newQuestions];
//         rangeStart += rangeStep;
//       } while (newQuestions.length === rangeStep);

//       // Fetch the user's name or email
//       const { data: { user }, error: userError } = await supabase.auth.getUser();

//       if (userError) {
//         throw new Error('Error fetching user data');
//       }

//       setQuestions(allQuestions);
//       setTestTaker(user?.user_metadata?.full_name || "Test Taker");
//       setLoading(false);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchQuestions();
//   }, [examName, file_name]);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div>
//       <QuizComponent 
//         questions={questions} 
//         quizName={decodeURIComponent(file_name)} 
//         examName={decodeURIComponent(examName)}
//         testTaker={testTaker}
//         isSelfExam={false}
//       />
//     </div>
//   );
// };

// export default QuizPage;
"use client";
import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QuizComponent from '@/components/QuizComponent';
import { Suspense } from 'react';
const QuizPage = ({ params }) => {
  const { examName, file_name } = params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [testTaker, setTestTaker] = useState(null);

  const fetchQuestions = async () => {
    const supabase = createClientComponentClient();
    try {
      const decodedExamName = decodeURIComponent(examName);
      const decodedFileName = decodeURIComponent(file_name);
      let allQuestions = [];
      let rangeStart = 0;
      const rangeStep = 1000;
      let newQuestions = [];

      do {
        const { data, error } = await supabase
          .from('qs')
          .select('*')
          .eq('file_name', decodedFileName)
          .eq('examname', decodedExamName)
          .range(rangeStart, rangeStart + rangeStep - 1);

        if (error) {
          throw new Error('Error fetching questions');
        }

        newQuestions = data;
        allQuestions = [...allQuestions, ...newQuestions];
        rangeStart += rangeStep;
      } while (newQuestions.length === rangeStep);

      // Fetch the user's name or email
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        throw new Error('Error fetching user data');
      }

      setQuestions(allQuestions);
      setTestTaker(user?.user_metadata?.full_name || "Test Taker");
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [examName, file_name]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Suspense>

    <div>
      <QuizComponent 
        questions={questions} 
        quizName={decodeURIComponent(file_name)} 
        examName={decodeURIComponent(examName)}
        testTaker={testTaker}
        isSelfExam={false}
      />
    </div>
    </Suspense>

  );
};

export default QuizPage;
