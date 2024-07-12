// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import Link from "next/link";
// import Header from "@/components/Header";
// import Wall from '@/components/Wall';
// import QuizzesClientComponent from '@/components/QuizzesClientComponent';
// import { Suspense } from "react";

// async function getQuizzesAndSubjects(examName) {
//   const supabase = createServerComponentClient({ cookies: () => cookies() });

//   try {
//     const { data: quizzes, error: quizzesError } = await supabase
//       .from('qtable')
//       .select('file_name, id, subject, examname')
//       .eq('examname', decodeURIComponent(examName));

//     if (quizzesError) {
//       console.error('Error fetching quizzes:', quizzesError);
//       throw new Error(`Failed to fetch quizzes: ${quizzesError.message}`);
//     }

//     if (!quizzes || quizzes.length === 0) {
//       return { quizzes: [], subjects: [] };
//     }

//     const uniqueQuizzes = quizzes.reduce((acc, quiz) => {
//       if (!acc[quiz.file_name]) {
//         acc[quiz.file_name] = { ...quiz, question_count: 0 };
//       }
//       acc[quiz.file_name].question_count++;
//       return acc;
//     }, {});

//     const subjectsMap = quizzes.reduce((acc, quiz) => {
//       if (!acc[quiz.subject]) {
//         acc[quiz.subject] = 0;
//       }
//       acc[quiz.subject]++;
//       return acc;
//     }, {});

//     const subjects = Object.entries(subjectsMap).map(([subject, count]) => ({
//       name: subject,
//       question_count: count
//     })).sort((a, b) => a.name.localeCompare(b.name));

//     return {
//       quizzes: Object.values(uniqueQuizzes),
//       subjects
//     };
//   } catch (error) {
//     console.error('Error in getQuizzesAndSubjects:', error);
//     throw error;
//   }
// }

// export default async function QuizzesListPage({ params }) {
//   const { examName } = params;
//   const data = await getQuizzesAndSubjects(examName);

//   const totalQuestions = data.quizzes.reduce((sum, quiz) => sum + quiz.question_count, 0);
//   const totalSubjects = data.subjects.length;

//   if (!data || (data.quizzes.length === 0 && data.subjects.length === 0)) {
//     return (
//       <Suspense>
//         <Header />
//         <br />
//         <br />
//         <br />
//         <div className="container mx-auto p-4 ">
//           <h1 className="text-3xl font-bold mb-4 text-center bg-yellow-100"> {decodeURIComponent(examName)}</h1>
//           <h1 className="text-3xl font-bold mb-4 text-center">To be added Soon</h1>
//         </div>
//       </Suspense>
//     );
//   }

//   return (
//     <Suspense>
//       <Wall examName={decodeURIComponent(examName)}>
//         <Header />
//         <div className="bg-white">
//           <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//             <div className="mx-auto max-w-2xl text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200 ">
//                 Qbank for {decodeURIComponent(examName)}
//               </h2>
//               <div className="flex justify-center gap-16 mt-10">
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{totalQuestions}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Study Questions</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{totalSubjects}</div>
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
//                   <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover-border-black">
//                     <Link href={`/quiz/${quiz.file_name.replace(/%20/g, '-')}`}>
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
//       </Wall>
//       <QuizzesClientComponent 
//         examName={decodeURIComponent(examName)}
//         totalQuestions={totalQuestions}
//         totalSubjects={totalSubjects}
//         data={data}
//       />
//     </Suspense>
//   );
// }

import Wall from '@/components/Wall';
import ExamsPage from '@/components/ExamsPage';

export default function ProtectedExamsPage() {
  return (
    <Wall>
      <ExamsPage />
    </Wall>
  );
}

