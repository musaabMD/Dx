// "use client";

// import React, { useState, useEffect } from 'react';
// import Header from "@/components/Header";
// // import Wall from '@/components/Wall';
// import Link from 'next/link'; // Import Link
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// export default function QuizzesClientComponent({ examName, totalQuestions, totalSubjects }) {
//   const [data, setData] = useState({ quizzes: [], subjects: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function fetchData() {
//       console.log('Fetching data for exam:', decodeURIComponent(examName));
//       try {
//         const decodedExamName = decodeURIComponent(examName);
        
//         const { data: quizzes, error: quizzesError } = await supabase
//           .from('qs')
//           .select('file_name, id, subject, examname')
//           .eq('examname', decodedExamName);
        
//         if (quizzesError) {
//           console.error('Error fetching quizzes:', quizzesError);
//           setError('Error fetching quizzes');
//           return;
//         }
        
//         console.log('Fetched quizzes:', quizzes);

//         const { data: fileSummary, error: fileSummaryError } = await supabase
//           .from('file_name_summary')
//           .select('file_name, file_name_count')
//           .eq('exam_initials', decodedExamName);
        
//         if (fileSummaryError) {
//           console.error('Error fetching file summary:', fileSummaryError);
//           setError('Error fetching file summary');
//           return;
//         }
        
//         console.log('Fetched file summary:', fileSummary);

//         const { data: examSummary, error: examSummaryError } = await supabase
//           .from('exam_summary')
//           .select('total_questions, total_file_names')
//           .eq('exam_initials', decodedExamName);
        
//         if (examSummaryError) {
//           console.error('Error fetching exam summary:', examSummaryError);
//           setError('Error fetching exam summary');
//           return;
//         }
        
//         console.log('Fetched exam summary:', examSummary);

//         const { data: subjectSummary, error: subjectSummaryError } = await supabase
//           .from('subject_summary')
//           .select('subject, subject_count')
//           .eq('exam_initials', decodedExamName);
        
//         if (subjectSummaryError) {
//           console.error('Error fetching subject summary:', subjectSummaryError);
//           setError('Error fetching subject summary');
//           return;
//         }

//         console.log('Fetched subject summary:', subjectSummary);

//         const fileMap = fileSummary.reduce((acc, file) => {
//           acc[file.file_name] = {
//             file_name: file.file_name,
//             question_count: file.file_name_count
//           };
//           return acc;
//         }, {});

//         const subjectsMap = subjectSummary.reduce((acc, subject) => {
//           const subjectName = subject.subject ? subject.subject.trim() : "Other";
//           if (!acc[subjectName]) {
//             acc[subjectName] = 0;
//           }
//           acc[subjectName] += subject.subject_count;
//           return acc;
//         }, {});

//         const subjects = Object.entries(subjectsMap)
//           .filter(([_, count]) => count >= 30)
//           .map(([subject, count]) => ({
//             name: subject,
//             question_count: count
//           }))
//           .sort((a, b) => a.name.localeCompare(b.name));

//         const fileCount = fileSummary.length;
//         const totalQuestions = examSummary.length > 0 ? examSummary[0].total_questions : 0;
//         const totalSubjects = subjects.length;

//         console.log('Setting state with quizzes and subjects data');
//         setData({
//           quizzes: Object.values(fileMap),
//           subjects,
//           fileCount,
//           totalQuestions,
//           totalSubjects
//         });
//         setLoading(false);
//       } catch (error) {
//         console.error('Error in fetchData:', error);
//         setError('An error occurred while fetching data. Please try again later.');
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, [examName, supabase]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <>
//       <Header />
//       {/* <Wall examName={decodeURIComponent(examName)}> */}
//         <div className="bg-white">
//           <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//             <div className="mx-auto max-w-2xl text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200 ">
//                 Qbank for {decodeURIComponent(examName)}
//               </h2>
//               <div className="flex justify-center gap-16 mt-10">
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{data.totalQuestions}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Study Questions</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{data.totalSubjects}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Subjects</div>
//                 </div>
//               </div>
//               <div className="mt-10 flex items-center justify-center gap-x-6">
//                 <a
//                   href="/pricing"
//                   className="rounded-md bg-red-500 px-5 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
//                 >
//                   Subscribe
//                 </a>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="container mx-auto p-4">
//           <section className="mb-8">
//             <h2 className="text-2xl font-semibold mb-3">Files</h2>
//             {data.quizzes.length > 0 ? (
//               <ul className="space-y-2">
//                 {data.quizzes.map((quiz, index) => (
//                   <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
//                     <Link href={`/quiz/${encodeURIComponent(quiz.file_name)}`}>
//                       <span className="text-blue-600 font-sans font-semibold">
//                         {quiz.file_name.replace(/%20/g, ' ')}
//                         <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No quizzes available for this exam.</p>
//             )}
//           </section>

//           <section>
//             <h2 className="text-2xl font-semibold mb-3">Subjects</h2>
//             {data.subjects.length > 0 ? (
//               <ul className="space-y-2">
//                 {data.subjects.map((subject, index) => (
//                   <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
//                     <Link href={`/exams/${encodeURIComponent(examName)}/subject/${encodeURIComponent(subject.name)}`}>
//                       <span className="text-blue-600 font-sans font-semibold">
//                         {subject.name}
//                         <span className="text-gray-500 text-sm ml-2">({subject.question_count} questions)</span>
//                       </span>
//                     </Link>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No subjects available for this exam.</p>
//             )}
//           </section>
//         </div>
//       {/* </Wall> */}
//     </>
//   );
// }
'use client';

import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Feedback from '@/components/Feedback';

export default function QuizzesClientComponent({ examName }) {
  const [data, setData] = useState({ quizzes: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      try {
        const decodedExamName = decodeURIComponent(examName);

        const { data: quizzes, error: quizzesError } = await supabase
          .from('qs')
          .select('file_name, id, subject, examname')
          .eq('examname', decodedExamName);

        if (quizzesError) {
          setError('Error fetching quizzes');
          return;
        }

        const { data: fileSummary, error: fileSummaryError } = await supabase
          .from('file_name_summary')
          .select('file_name, file_name_count')
          .eq('exam_initials', decodedExamName);

        if (fileSummaryError) {
          setError('Error fetching file summary');
          return;
        }

        const { data: examSummary, error: examSummaryError } = await supabase
          .from('exam_summary')
          .select('total_questions, total_file_names')
          .eq('exam_initials', decodedExamName);

        if (examSummaryError) {
          setError('Error fetching exam summary');
          return;
        }

        const { data: subjectSummary, error: subjectSummaryError } = await supabase
          .from('subject_summary')
          .select('subject, subject_count')
          .eq('exam_initials', decodedExamName);

        if (subjectSummaryError) {
          setError('Error fetching subject summary');
          return;
        }

        const fileMap = fileSummary.reduce((acc, file) => {
          acc[file.file_name] = {
            file_name: file.file_name,
            question_count: file.file_name_count
          };
          return acc;
        }, {});

        const subjectsMap = subjectSummary.reduce((acc, subject) => {
          const subjectName = subject.subject ? subject.subject.trim() : "Other";
          if (!acc[subjectName]) {
            acc[subjectName] = 0;
          }
          acc[subjectName] += subject.subject_count;
          return acc;
        }, {});

        const subjects = Object.entries(subjectsMap)
          .filter(([_, count]) => count >= 30)
          .map(([subject, count]) => ({
            name: subject,
            question_count: count
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        const fileCount = fileSummary.length;
        const totalQuestions = examSummary.length > 0 ? examSummary[0].total_questions : 0;
        const totalSubjects = subjects.length;

        setData({
          quizzes: Object.values(fileMap),
          subjects,
          fileCount,
          totalQuestions,
          totalSubjects
        });
        setLoading(false);
      } catch (error) {
        setError('An error occurred while fetching data. Please try again later.');
        setLoading(false);
      }
    }

    fetchData();
  }, [examName, supabase]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Header />
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200 ">
              Qbank for {decodeURIComponent(examName)}
            </h2>
            <div className="flex justify-center gap-16 mt-10">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900">{data.totalQuestions}</div>
                <div className="mt-2 text-lg font-semibold text-gray-600">Study Questions</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900">{data.totalSubjects}</div>
                <div className="mt-2 text-lg font-semibold text-gray-600">Subjects</div>
              </div>
            </div>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/pricing"
                className="rounded-md bg-red-500 px-5 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Subscribe
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Files</h2>
          {data.quizzes.length > 0 ? (
            <ul className="space-y-2">
              {data.quizzes.map((quiz, index) => (
                <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
                  <Link href={`/quiz/${encodeURIComponent(quiz.file_name)}`}>
                    <span className="text-blue-600 font-sans font-semibold">
                      {quiz.file_name.replace(/%20/g, ' ')}
                      <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
                    </span>
                  </Link>
                  <Feedback questionId={quiz.id} examName={decodedExamName} currentAnswer={quiz.correct_choice} options={[
                      { letter: 'A', text: quiz.option_a },
                      { letter: 'B', text: quiz.option_b },
                      { letter: 'C', text: quiz.option_c },
                      { letter: 'D', text: quiz.option_d }
                    ]} />
                </li>
              ))}
            </ul>
          ) : (
            <p>No quizzes available for this exam.</p>
          )}
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-3">Subjects</h2>
          {data.subjects.length > 0 ? (
            <ul className="space-y-2">
              {data.subjects.map((subject, index) => (
                <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
                  <Link href={`/exams/${encodeURIComponent(examName)}/subject/${encodeURIComponent(subject.name)}`}>
                    <span className="text-blue-600 font-sans font-semibold">
                      {subject.name}
                      <span className="text-gray-500 text-sm ml-2">({subject.question_count} questions)</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No subjects available for this exam.</p>
          )}
        </section>
      </div>
    </>
  );
}
