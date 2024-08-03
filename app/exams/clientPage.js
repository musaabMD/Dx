// "use client";

// import React, { useState } from 'react';
// import Link from "next/link";
// import Header from "@/components/Header";
// import Wall from '@/components/Wall';
// import UpgradeModal from "@/components/UpgradeModal";

// const ClientPage = ({ examName, totalQuestions, totalSubjects, data }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleQuizClick = (e) => {
//     e.preventDefault();
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <>
//       <Wall examName={decodeURIComponent(examName)}>
//         <div className="bg-white">
//           <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//             <div className="mx-auto max-w-2xl text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200 ">
//                 Qbank for {decodeURIComponent(examName)}
//               </h2>
//               <div className="flex justify-center gap-16 mt-10">
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{totalQuestions}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Questions</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{totalSubjects}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Subjects </div>
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
//                     <a href="#" onClick={handleQuizClick}>
//                       <span className="text-blue-600 font-sans font-semibold">
//                         {quiz.file_name.replace(/%20/g, ' ')}
//                         <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
//                       </span>
//                     </a>
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
//                     <a href="#" onClick={handleQuizClick}>
//                       <span className="text-blue-600 font-sans font-semibold">
//                         {subject.name}
//                         <span className="text-gray-500 text-sm ml-2">({subject.question_count} questions)</span>
//                       </span>
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No subjects available for this exam.</p>
//             )}
//           </section>
//         </div>
//       </Wall>
//       <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />
//     </>
//   );
// };

// export default ClientPage;

// "use client";

// import React, { useState } from 'react';
// import Link from "next/link";
// import Header from "@/components/Header";
// import Wall from '@/components/Wall';
// import UpgradeModal from "@/components/UpgradeModal";

// const ClientPage = ({ examName, totalQuestions, totalSubjects, data }) => {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const handleQuizClick = (e) => {
//     e.preventDefault();
//     setIsModalOpen(true);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//   };

//   return (
//     <>
//       <Wall examName={decodeURIComponent(examName)}>
//         <div className="bg-white">
//           <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
//             <div className="mx-auto max-w-2xl text-center">
//               <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200 ">
//                 Qbank for {decodeURIComponent(examName)}
//               </h2>
//               <div className="flex justify-center gap-16 mt-10">
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{totalQuestions}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Questions</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-6xl font-bold text-gray-900">{totalSubjects}</div>
//                   <div className="mt-2 text-lg font-semibold text-gray-600">Subjects </div>
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
//                     <a href="#" onClick={handleQuizClick}>
//                       <span className="text-blue-600 font-sans font-semibold">
//                         {quiz.file_name.replace(/%20/g, ' ')}
//                         <span className="text-gray-500 text-sm ml-2">({quiz.question_count} questions)</span>
//                       </span>
//                     </a>
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
//                     <a href="#" onClick={handleQuizClick}>
//                       <span className="text-blue-600 font-sans font-semibold">
//                         {subject.name}
//                         <span className="text-gray-500 text-sm ml-2">({subject.question_count} questions)</span>
//                       </span>
//                     </a>
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <p>No subjects available for this exam.</p>
//             )}
//           </section>
//         </div>
//       </Wall>
//       <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />
//     </>
//   );
// };
"use client";

import React, { useState, useEffect } from 'react';
import Link from "next/link";
import Header from "@/components/Header";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import UpgradeModal from "@/components/UpgradeModal";

const ClientPage = ({ examName, totalQuestions, totalSubjects, data }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      const supabase = createClientComponentClient();
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setFetchError("User session not found");
        return;
      }

      const { data, error } = await supabase
        .from('user_data')
        .select('subscription_status, remaining_days, disable')
        .eq('user_id', session.user.id)
        .eq('examname', examName)
        .single();

      if (error) {
        console.error('Subscription fetch error:', error);
        setFetchError(error);
      } else {
        setSubscriptionStatus(data);
      }
    };

    fetchSubscriptionStatus();
  }, [examName]);

  const handleQuizClick = (e) => {
    if (!subscriptionStatus || subscriptionStatus.subscription_status !== 'active') {
      e.preventDefault();
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (fetchError) {
    return (
      <div>
        <Header />
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p>Error loading subscription data. Please try again later.</p>
          <p>Error details: {fetchError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white">
        <Header />
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-800 sm:text-4xl bg-yellow-200 ">
              Qbank for {decodeURIComponent(examName)}
            </h2>
            <div className="flex justify-center gap-16 mt-10">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900">{totalQuestions}</div>
                <div className="mt-2 text-lg font-semibold text-gray-600">Questions</div>
              </div>
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-900">{totalSubjects}</div>
                <div className="mt-2 text-lg font-semibold text-gray-600">Subjects </div>
              </div>
            </div>
            {!subscriptionStatus || subscriptionStatus.subscription_status !== 'active' ? (
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <a
                  href="/pricing"
                  className="rounded-md bg-red-500 px-5 py-4 text-2xl font-semibold text-white shadow-sm hover:bg-red-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Subscribe
                </a>
              </div>
            ) : null}
          </div>
        </div>
        <div className="container mx-auto p-4">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-3">Files</h2>
            {data.quizzes.length > 0 ? (
              <ul className="space-y-2">
                {data.quizzes.map((quiz, index) => (
                  <li key={index} className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover-border-3 hover-border-black">
                    <Link href={`/quiz/${quiz.file_name.replace(/%20/g, '-')}`} onClick={handleQuizClick}>
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
                    <Link href={`/subject/${subject.name.replace(/%20/g, '-')}`} onClick={handleQuizClick}>
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
      </div>
      <UpgradeModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default ClientPage;
