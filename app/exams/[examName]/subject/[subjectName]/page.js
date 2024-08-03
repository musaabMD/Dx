
// 'use client';

// import React, { useState, useEffect, Suspense } from 'react';
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import Link from "next/link";
// import Header from "@/components/Header";
// import QuizComponent from "@/components/QuizComponent";
// import Wall from '@/components/Wall';
// import { Suspense } from 'react';

// export default function SubjectQuizPage({ params }) {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { examName, subjectName } = params;
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function getSubjectQuestions() {
//       try {
//         const { data, error } = await supabase
//           .from('qtable')
//           .select('*')
//           .eq('examname', decodeURIComponent(examName))
//           .eq('subject', decodeURIComponent(subjectName));

//         if (error) throw error;
//         setQuestions(data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching subject questions:', error);
//         setError('Failed to load questions. Please try again.');
//         setLoading(false);
//       }
//     }

//     getSubjectQuestions();
//   }, [examName, subjectName, supabase]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <Suspense> 
//     <Wall examName={decodeURIComponent(examName)}>
//       <div className="w-full">
//         {questions.length > 0 ? (
//           <QuizComponent
//             questions={questions}
//             quizName={`${decodeURIComponent(subjectName)} (${decodeURIComponent(examName)})`}
//             testTaker="Subject Quiz"
//             isSelfExam={false}
//           />
//         ) : (
//           <p>No questions found for this subject.</p>
//         )}
//         <Link href={`/exams/${encodeURIComponent(examName)}`} className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
//           Back to Exam
//         </Link>
//       </div>
//     </Wall>
//     </Suspense>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import Link from 'next/link';
// import QuizComponent from '@/components/QuizComponent';
// import Wall from '@/components/Wall';

// export default function SubjectQuizPage({ params }) {
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const { examName, subjectName } = params;
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function getSubjectQuestions() {
//       try {
//         const { data, error } = await supabase
//           .from('qtable')
//           .select('*')
//           .eq('examname', decodeURIComponent(examName))
//           .eq('subject', decodeURIComponent(subjectName));

//         if (error) throw error;
//         setQuestions(data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching subject questions:', error);
//         setError('Failed to load questions. Please try again.');
//         setLoading(false);
//       }
//     }

//     getSubjectQuestions();
//   }, [examName, subjectName, supabase]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <Wall examName={decodeURIComponent(examName)}>
//       <div className="w-full">
//         {questions.length > 0 ? (
//           <QuizComponent
//             questions={questions}
//             quizName={`${decodeURIComponent(subjectName)} (${decodeURIComponent(examName)})`}
//             testTaker="Subject Quiz"
//             isSelfExam={false}
//           />
//         ) : (
//           <p>No questions found for this subject.</p>
//         )}
//         <Link href={`/exams/${encodeURIComponent(examName)}`} className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
//           Back to Exam
//         </Link>
//       </div>
//     </Wall>
//   );
// }
'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import QuizComponent from '@/components/QuizComponent';
import UpgradeModal from '@/components/UpgradeModal';

export default function SubjectQuizPage({ params }) {
  const { examName, subjectName } = params;
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function checkSubscriptionStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data, error } = await supabase
            .from('user_data')
            .select('subscription_status, remaining_days, disable, trial, examname')
            .eq('user_id', session.user.id)
            .eq('examname', decodeURIComponent(examName))
            .single();

          if (error) {
            throw error;
          }

          const subscriptionStatus = data.subscription_status?.toLowerCase();
          const remainingDays = data.remaining_days;
          const isDisabled = data.disable;
          const isTrial = data.trial;

          const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled) || isTrial;

          if (isActive) {
            setHasActiveSubscription(true);
          }
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }

    async function getSubjectQuestions() {
      setLoading(true);
      setError(null);
      const decodedExamName = decodeURIComponent(examName);
      const decodedSubjectName = decodeURIComponent(subjectName);

      if (!hasActiveSubscription) {
        setIsModalOpen(true);
        setLoading(false);
        return;
      }

      let allQuestions = [];
      let rangeStart = 0;
      const rangeStep = 1000;
      let newQuestions = [];

      try {
        do {
          const { data, error } = await supabase
            .from('qs')
            .select('*')
            .eq('examname', decodedExamName)
            .eq('subject', decodedSubjectName)
            .range(rangeStart, rangeStart + rangeStep - 1);

          if (error) throw error;
          newQuestions = data;
          allQuestions = [...allQuestions, ...newQuestions];
          rangeStart += rangeStep;
        } while (newQuestions.length === rangeStep);
      } catch (error) {
        console.error('Error fetching subject questions:', error);
        setError('Failed to load questions. Please try again.');
      }

      setQuestions(allQuestions);
      setLoading(false);
    }

    checkSubscriptionStatus();
    getSubjectQuestions();
  }, [examName, subjectName, supabase, hasActiveSubscription]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="w-full">
      {questions.length > 0 ? (
        <QuizComponent
          questions={questions}
          quizName={`${decodeURIComponent(subjectName)} (${decodeURIComponent(examName)})`}
          testTaker="Subject Quiz"
          isSelfExam={false}
        />
      ) : (
        <p>No questions found for this subject.</p>
      )}
      {!hasActiveSubscription && <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
      <Link href={`/exams/${encodeURIComponent(examName)}`} className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
        Back to Exam
      </Link>
    </div>
  );
}
