
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
import Wall from '@/components/Wall';

export default function SubjectQuizPage({ params }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { examName, subjectName } = params;
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getSubjectQuestions() {
      try {
        const { data, error } = await supabase
          .from('qs')
          .select('*')
          .eq('examname', decodeURIComponent(examName))
          .eq('subject', decodeURIComponent(subjectName));

        if (error) throw error;
        setQuestions(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching subject questions:', error);
        setError('Failed to load questions. Please try again.');
        setLoading(false);
      }
    }

    getSubjectQuestions();
  }, [examName, subjectName, supabase]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Wall examName={decodeURIComponent(examName)}>
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
      
      </div>
    </Wall>
  );
}
