// 'use client';

// import React, { useState, useEffect } from 'react';
// import Header from "@/components/Header";
// import Link from 'next/link';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// export default function QuizzesClientComponent({ params }) {
//   const { examName } = params;
//   const [data, setData] = useState({ quizzes: [], subjects: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [totalQuestions, setTotalQuestions] = useState(0);
//   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function fetchData() {
//       const decodedExamName = decodeURIComponent(examName);

//       try {
//         // Fetch total question count
//         const { data: totalQuestionsData, error: totalQuestionsError } = await supabase
//           .from('qs')
//           .select('id', { count: 'exact' })
//           .eq('examname', decodedExamName);

//         if (totalQuestionsError) {
//           setError('Error fetching total question count');
//           return;
//         }

//         setTotalQuestions(totalQuestionsData.length);

//         // Fetch quizzes
//         const { data: quizzes, error: quizzesError } = await supabase
//           .from('qs')
//           .select('file_name, id, subject, examname')
//           .eq('examname', decodedExamName);

//         if (quizzesError) {
//           setError('Error fetching quizzes');
//           return;
//         }

//         // Fetch file summary
//         const { data: fileSummary, error: fileSummaryError } = await supabase
//           .from('file_name_summary')
//           .select('file_name, file_name_count')
//           .eq('exam_initials', decodedExamName);

//         if (fileSummaryError) {
//           setError('Error fetching file summary');
//           return;
//         }

//         // Fetch exam summary
//         const { data: examSummary, error: examSummaryError } = await supabase
//           .from('exam_summary')
//           .select('total_questions, total_file_names')
//           .eq('exam_initials', decodedExamName);

//         if (examSummaryError) {
//           setError('Error fetching exam summary');
//           return;
//         }

//         // Fetch subject summary
//         const { data: subjectSummary, error: subjectSummaryError } = await supabase
//           .from('subject_summary')
//           .select('subject, subject_count')
//           .eq('exam_initials', decodedExamName);

//         if (subjectSummaryError) {
//           setError('Error fetching subject summary');
//           return;
//         }

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

//         setData({
//           quizzes: Object.values(fileMap),
//           subjects,
//           fileCount,
//           totalQuestions,
//           totalSubjects
//         });
//         setLoading(false);
//       } catch (error) {
//         setError('An error occurred while fetching data. Please try again later.');
//         setLoading(false);
//       }
//     }

//     async function checkSubscriptionStatus() {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         if (session) {
//           const { data, error } = await supabase
//             .from('user_data')
//             .select('subscription_status, remaining_days, disable, trial, examname, user_id, name, email')
//             .eq('user_id', session.user.id)
//             .single();

//           if (error) {
//             throw error;
//           }

//           const subscriptionStatus = data.subscription_status?.toLowerCase();
//           const remainingDays = data.remaining_days;
//           const isDisabled = data.disable;
//           const isTrial = data.trial;

//           const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled) || isTrial;

//           console.log(`User subscription status: ${subscriptionStatus}`);
//           console.log(`Remaining days: ${remainingDays}`);
//           console.log(`Is disabled: ${isDisabled}`);
//           console.log(`Is trial: ${isTrial}`);
//           console.log(`Exam name: ${data.examname}`);
//           console.log(`User data:`, data);

//           if (isActive) {
//             setHasActiveSubscription(true);
//           }
//         }
//       } catch (error) {
//         console.error('Error checking subscription status:', error);
//       }
//     }

//     fetchData();
//     checkSubscriptionStatus();
//   }, [examName, supabase]);

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <>
//       <Header />
//       <div className="bg-white">
//         <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//           <div className="mx-auto max-w-2xl text-center">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200">
//               Qbank for {decodeURIComponent(examName)}
//             </h2>
//             <div className="flex justify-center gap-16 mt-10">
//               <div className="text-center">
//                 <div className="text-6xl font-bold text-gray-900">{data.totalQuestions}</div>
//                 <div className="mt-2 text-lg font-semibold text-gray-600">Study Questions</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-6xl font-bold text-gray-900">{data.totalSubjects}</div>
//                 <div className="mt-2 text-lg font-semibold text-gray-600">Subjects</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-6xl font-bold text-gray-900">{data.fileCount}</div>
//                 <div className="mt-2 text-lg font-semibold text-gray-600">Files</div>
//               </div>
//             </div>
//             {!hasActiveSubscription && (
//               <div className="mt-10 flex items-center justify-center gap-x-6">
//                 <a
//                   href="/pricing"
//                   className="rounded-md bg-red-500 px-5 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-red-900"
//                 >
//                   Subscribe
//                 </a>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="container mx-auto p-4">
//         <section className="mb-8">
//           <h2 className="text-2xl font-semibold mb-3">Files</h2>
//           {data.quizzes.length > 0 ? (
//             <ul className="space-y-2">
//               {data.quizzes.map((quiz, index) => (
//                 <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover:border-black">
//                   <Link href={`/exams/${encodeURIComponent(examName)}/${encodeURIComponent(quiz.file_name)}`}>
//                     <span className="text-blue-600 font-sans font-semibold">
//                       {quiz.file_name.replace(/%20/g, ' ')}
//                       <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
//                     </span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No quizzes available for this exam.</p>
//           )}
//         </section>

//         <section>
//           <h2 className="text-2xl font-semibold mb-3">Subjects</h2>
//           {data.subjects.length > 0 ? (
//             <ul className="space-y-2">
//               {data.subjects.map((subject, index) => (
//                 <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
//                   <Link href={`/exams/${encodeURIComponent(examName)}/subject/${encodeURIComponent(subject.name)}`}>
//                     <span className="text-blue-600 font-sans font-semibold">
//                       {subject.name}
//                       <span className="text-gray-500 text-sm ml-2">({subject.question_count} questions)</span>
//                     </span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No subjects available for this exam.</p>
//           )}
//         </section>
//       </div>
//     </>
//   );
// }

// 'use client';

// import React, { useState, useEffect } from 'react';
// import Header from "@/components/Header";
// import Link from 'next/link';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import UpgradeModal from '@/components/UpgradeModal';

// export default function QuizzesClientComponent({ params }) {
//   const { examName } = params;
//   const [data, setData] = useState({ quizzes: [], subjects: [] });
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [totalQuestions, setTotalQuestions] = useState(0);
//   const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     async function fetchData() {
//       const decodedExamName = decodeURIComponent(examName);

//       try {
//         // Fetch total question count
//         const { data: totalQuestionsData, error: totalQuestionsError } = await supabase
//           .from('qs')
//           .select('id', { count: 'exact' })
//           .eq('examname', decodedExamName);

//         if (totalQuestionsError) {
//           setError('Error fetching total question count');
//           return;
//         }

//         setTotalQuestions(totalQuestionsData.length);

//         // Fetch quizzes
//         const { data: quizzes, error: quizzesError } = await supabase
//           .from('qs')
//           .select('file_name, id, subject, examname')
//           .eq('examname', decodedExamName);

//         if (quizzesError) {
//           setError('Error fetching quizzes');
//           return;
//         }

//         // Fetch file summary
//         const { data: fileSummary, error: fileSummaryError } = await supabase
//           .from('file_name_summary')
//           .select('file_name, file_name_count')
//           .eq('exam_initials', decodedExamName);

//         if (fileSummaryError) {
//           setError('Error fetching file summary');
//           return;
//         }

//         // Fetch exam summary
//         const { data: examSummary, error: examSummaryError } = await supabase
//           .from('exam_summary')
//           .select('total_questions, total_file_names')
//           .eq('exam_initials', decodedExamName);

//         if (examSummaryError) {
//           setError('Error fetching exam summary');
//           return;
//         }

//         // Fetch subject summary
//         const { data: subjectSummary, error: subjectSummaryError } = await supabase
//           .from('subject_summary')
//           .select('subject, subject_count')
//           .eq('exam_initials', decodedExamName);

//         if (subjectSummaryError) {
//           setError('Error fetching subject summary');
//           return;
//         }

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

//         setData({
//           quizzes: Object.values(fileMap),
//           subjects,
//           fileCount,
//           totalQuestions,
//           totalSubjects
//         });
//         setLoading(false);
//       } catch (error) {
//         setError('An error occurred while fetching data. Please try again later.');
//         setLoading(false);
//       }
//     }

//     async function checkSubscriptionStatus() {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         if (session) {
//           const { data, error } = await supabase
//             .from('user_data')
//             .select('subscription_status, remaining_days, disable, trial, examname, user_id, name, email')
//             .eq('user_id', session.user.id)
//             .eq('examname', decodeURIComponent(examName))
//             .single();

//           if (error) {
//             throw error;
//           }

//           const subscriptionStatus = data.subscription_status?.toLowerCase();
//           const remainingDays = data.remaining_days;
//           const isDisabled = data.disable;
//           const isTrial = data.trial;

//           const isActive = (subscriptionStatus === 'active' && remainingDays > 0 && !isDisabled) || isTrial;

//           console.log(`User subscription status: ${subscriptionStatus}`);
//           console.log(`Remaining days: ${remainingDays}`);
//           console.log(`Is disabled: ${isDisabled}`);
//           console.log(`Is trial: ${isTrial}`);
//           console.log(`Exam name: ${data.examname}`);
//           console.log(`User data:`, data);

//           if (isActive) {
//             setHasActiveSubscription(true);
//           }
//         }
//       } catch (error) {
//         console.error('Error checking subscription status:', error);
//       }
//     }

//     fetchData();
//     checkSubscriptionStatus();
//   }, [examName, supabase]);

//   const handleQuizAccess = (e) => {
//     if (!hasActiveSubscription) {
//       e.preventDefault();
//       setIsModalOpen(true);
//     }
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <>
//       <Header />
//       <div className="bg-white">
//         <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//           <div className="mx-auto max-w-2xl text-center">
//             <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200">
//               Qbank for {decodeURIComponent(examName)}
//             </h2>
//             <div className="flex justify-center gap-16 mt-10">
//               <div className="text-center">
//                 <div className="text-6xl font-bold text-gray-900">{data.totalQuestions}</div>
//                 <div className="mt-2 text-lg font-semibold text-gray-600">Study Questions</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-6xl font-bold text-gray-900">{data.totalSubjects}</div>
//                 <div className="mt-2 text-lg font-semibold text-gray-600">Subjects</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-6xl font-bold text-gray-900">{data.fileCount}</div>
//                 <div className="mt-2 text-lg font-semibold text-gray-600">Files</div>
//               </div>
//             </div>
//             {!hasActiveSubscription && (
//               <div className="mt-10 flex items-center justify-center gap-x-6">
//                 <a
//                   href="/pricing"
//                   className="rounded-md bg-red-500 px-5 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-red-900"
//                 >
//                   Subscribe
//                 </a>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="container mx-auto p-4">
//         <section className="mb-8">
//           <h2 className="text-2xl font-semibold mb-3">Files</h2>
//           {data.quizzes.length > 0 ? (
//             <ul className="space-y-2">
//               {data.quizzes.map((quiz, index) => (
//                 <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover:border-black">
//                   <Link href={`/exams/${encodeURIComponent(examName)}/${encodeURIComponent(quiz.file_name)}`} onClick={handleQuizAccess}>
//                     <span className="text-blue-600 font-sans font-semibold">
//                       {quiz.file_name.replace(/%20/g, ' ')}
//                       <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
//                     </span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No quizzes available for this exam.</p>
//           )}
//         </section>

//         <section>
//           <h2 className="text-2xl font-semibold mb-3">Subjects</h2>
//           {data.subjects.length > 0 ? (
//             <ul className="space-y-2">
//               {data.subjects.map((subject, index) => (
//                 <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
//                   <Link href={`/exams/${encodeURIComponent(examName)}/subject/${encodeURIComponent(subject.name)}`} onClick={handleQuizAccess}>
//                     <span className="text-blue-600 font-sans font-semibold">
//                       {subject.name}
//                       <span className="text-gray-500 text-sm ml-2">({subject.question_count} questions)</span>
//                     </span>
//                   </Link>
//                 </li>
//               ))}
//             </ul>
//           ) : (
//             <p>No subjects available for this exam.</p>
//           )}
//         </section>
//       </div>
//       {!hasActiveSubscription && <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
//     </>
//   );
// }

"use client"
import React, { useState, useEffect } from 'react';
import Header from "@/components/Header";
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import UpgradeModal from '@/components/UpgradeModal';
import { Suspense } from 'react';

export default function QuizzesClientComponent({ params }) {
  const { examName } = params;
  const [data, setData] = useState({ quizzes: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchData() {
      const decodedExamName = decodeURIComponent(examName);

      try {
        // Fetch total question count
        const { data: totalQuestionsData, error: totalQuestionsError } = await supabase
          .from('qs')
          .select('id', { count: 'exact' })
          .eq('examname', decodedExamName);

        if (totalQuestionsError) {
          setError('Error fetching total question count');
          return;
        }

        setTotalQuestions(totalQuestionsData.length);

        // Fetch quizzes
        const { data: quizzes, error: quizzesError } = await supabase
          .from('qs')
          .select('file_name, id, subject, examname')
          .eq('examname', decodedExamName);

        if (quizzesError) {
          setError('Error fetching quizzes');
          return;
        }

        // Fetch file summary
        const { data: fileSummary, error: fileSummaryError } = await supabase
          .from('file_name_summary')
          .select('file_name, file_name_count')
          .eq('exam_initials', decodedExamName);

        if (fileSummaryError) {
          setError('Error fetching file summary');
          return;
        }

        // Fetch exam summary
        const { data: examSummary, error: examSummaryError } = await supabase
          .from('exam_summary')
          .select('total_questions, total_file_names')
          .eq('exam_initials', decodedExamName);

        if (examSummaryError) {
          setError('Error fetching exam summary');
          return;
        }

        // Fetch subject summary
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

    async function checkSubscriptionStatus() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data, error } = await supabase
            .from('user_data')
            .select('subscription_status, remaining_days, disable, trial, examname, user_id, name, email')
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

          console.log(`User subscription status: ${subscriptionStatus}`);
          console.log(`Remaining days: ${remainingDays}`);
          console.log(`Is disabled: ${isDisabled}`);
          console.log(`Is trial: ${isTrial}`);
          console.log(`Exam name: ${data.examname}`);
          console.log(`User data:`, data);

          if (isActive) {
            setHasActiveSubscription(true);
          }
        }
      } catch (error) {
        console.error('Error checking subscription status:', error);
      }
    }

    fetchData();
    checkSubscriptionStatus();
  }, [examName, supabase]);

  const handleQuizAccess = (e) => {
    if (!hasActiveSubscription) {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
          <Suspense>



      <Header />
      <div className="bg-white">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200">
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
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900">{data.fileCount}</div>
                <div className="mt-2 text-lg font-semibold text-gray-600">Files</div>
              </div>
            </div>
            {!hasActiveSubscription && (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="/pricing"
                  className="rounded-md bg-red-500 px-5 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-red-900"
                >
                  Subscribe
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-3">Files</h2>
          {data.quizzes.length > 0 ? (
            <ul className="space-y-2">
              {data.quizzes.map((quiz, index) => (
                <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover:border-black">
                  <Link href={`/exams/${encodeURIComponent(examName)}/${encodeURIComponent(quiz.file_name)}`} onClick={handleQuizAccess}>
                    <span className="text-blue-600 font-sans font-semibold">
                      {quiz.file_name.replace(/%20/g, ' ')}
                      <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
                    </span>
                  </Link>
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
                  <Link href={`/exams/${encodeURIComponent(examName)}/subject/${encodeURIComponent(subject.name)}`} onClick={handleQuizAccess}>
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
      {!hasActiveSubscription && <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />}
      </Suspense>

    </>
   

  );
}
