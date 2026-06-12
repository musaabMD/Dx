// 'use client';

// import React from 'react';
// import { useRouter } from 'next/navigation';
// import Review from './Review';
// import Header from '@/components/Header';

// const Score = ({ score, totalQuestions, quizName, time, answers }) => {
//   const router = useRouter();

//   const formatTime = (seconds) => {
//     if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const formattedResponses = answers.map(answer => ({
//     qtable: {
//       question_text: answer.question,
//       correct_choice: answer.correctAnswer,
//       rationale: answer.rationale,
//       subject: answer.subject || 'Unknown',
//     },
//     user_answer: answer.selectedAnswer,
//     is_bookmarked: answer.isBookmarked,
//     feedback: answer.feedback
//   }));

//   // Calculate scores per subject
//   const subjectScores = formattedResponses.reduce((acc, response) => {
//     const subject = response.qtable.subject;
//     if (!acc[subject]) {
//       acc[subject] = { correct: 0, total: 0 };
//     }
//     acc[subject].total += 1;
//     if (response.user_answer === response.qtable.correct_choice) {
//       acc[subject].correct += 1;
//     }
//     return acc;
//   }, {});

//   // Calculate the overall score percentage
//   const overallScorePercentage = Math.round((score / totalQuestions) * 100);

//   // Determine progress bar class based on score
//   const progressBarClass = overallScorePercentage > 80 
//     ? "progress progress-success w-56" 
//     : overallScorePercentage > 70 
//       ? "progress progress-primary w-56" 
//       : overallScorePercentage <= 60 
//         ? "progress progress-error w-56" 
//         : "progress w-56";

//   return (
//     <div className="min-h-screen bg-gray-100">
//       <div className="py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="px-4 py-5 sm:p-6">
//             <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{quizName} Results</h2>
//             <div className="text-center mb-6">
//               <p className="text-4xl font-bold text-blue-600">
//                 {score} / {totalQuestions}
//               </p>
//               <p className="text-gray-500 mt-2">Time taken: {formatTime(time)}</p>
//               <div className="mt-4">
//                 {/* <progress className={progressBarClass} value={overallScorePercentage} max="100"></progress>
//                 <p className="text-gray-500 mt-2">{overallScorePercentage}%</p> */}
//                 <div
//                   className="radial-progress bg-primary text-primary-content border-primary border-4"
//                   style={{ "--value": overallScorePercentage }}
//                   role="progressbar"
//                 >
//                   {overallScorePercentage}%
//                 </div>
//               </div>
//             </div>

//             {/* Subject-wise scores */}
//             <div className="mb-6">
//               <h3 className="text-xl font-semibold mb-3">Scores by Subject</h3>
//               {Object.entries(subjectScores).map(([subject, { correct, total }]) => (
//                 <div key={subject} className="flex justify-between items-center mb-2">
//                   <span>{subject}:</span>
//                   <div className="flex items-center">
//                     <span className="mr-2">{correct}/{total}</span>
//                     <progress className="progress progress-info w-32" value={(correct / total) * 100} max="100"></progress>
//                     <span className="ml-2">({Math.round((correct / total) * 100)}%)</span>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* <Review responses={formattedResponses} /> */}
//             <div className="mt-6 text-center">
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Review your answers
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // export default Score;
// 'use client';

// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';
// import Review from './Review';
// import { Suspense } from 'react';

// const Score = ({ score, totalQuestions, quizName, time, answers }) => {
//   const router = useRouter();

//   const formatTime = (seconds) => {
//     if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const formattedResponses = answers.map(answer => ({
//     qtable: {
//       question_text: answer.question,
//       correct_choice: answer.correctAnswer,
//       rationale: answer.rationale,
//       subject: answer.subject || 'Unknown',
//     },
//     user_answer: answer.selectedAnswer,
//     is_bookmarked: answer.isBookmarked,
//     feedback: answer.feedback
//   }));

//   // Calculate scores per subject
//   const subjectScores = formattedResponses.reduce((acc, response) => {
//     const subject = response.qtable.subject;
//     if (!acc[subject]) {
//       acc[subject] = { correct: 0, total: 0 };
//     }
//     acc[subject].total += 1;
//     if (response.user_answer === response.qtable.correct_choice) {
//       acc[subject].correct += 1;
//     }
//     return acc;
//   }, {});

//   // Calculate the overall score percentage
//   const overallScorePercentage = Math.round((score / totalQuestions) * 100);

//   // Determine progress bar class based on score
//   const progressBarClass = overallScorePercentage > 80 
//     ? "progress progress-success w-56" 
//     : overallScorePercentage > 70 
//       ? "progress progress-primary w-56" 
//       : overallScorePercentage <= 60 
//         ? "progress progress-error w-56" 
//         : "progress w-56";

//   return (

//     <>
//     <Suspense>

//     <Header />

//     <div className="min-h-screen bg-gray-100">
        
//       <div className="py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
//           <div className="px-4 py-5 sm:p-6">
//             <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{quizName} Results</h2>
//             <div className="text-center mb-6">
//               <p className="text-4xl font-bold text-blue-600">
//                 {score} / {totalQuestions}
//               </p>
//               <p className="text-gray-500 mt-2">Time taken: {formatTime(time)}</p>
//               <div className="mt-4">
//                 <div
//                   className="radial-progress bg-primary text-primary-content border-primary border-4"
//                   style={{ "--value": overallScorePercentage }}
//                   role="progressbar"
//                 >
//                   {overallScorePercentage}%
//                 </div>
//               </div>
//             </div>

//             {/* Subject-wise scores */}
//             <div className="mb-6">
//               <h3 className="text-xl font-semibold mb-3">Scores by Subject</h3>
//               {Object.entries(subjectScores).map(([subject, { correct, total }]) => (
//                 <div key={subject} className="flex justify-between items-center mb-2">
//                   <span>{subject}:</span>
//                   <div className="flex items-center">
//                     <span className="mr-2">{correct}/{total}</span>
//                     <progress className="progress progress-info w-32" value={(correct / total) * 100} max="100"></progress>
//                     <span className="ml-2">({Math.round((correct / total) * 100)}%)</span>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-6 text-center">
//               <button
//                 onClick={() => router.push('/dashboard')}
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Review your answers
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     </Suspense>
//     </>
//   );
// };

// // export default Score;
// 'use client';

// import { useRouter } from 'next/navigation';
// import Header from '@/components/Header';
// import Review from './Review';
// import { Suspense, useState } from 'react';

// const Score = ({ score, totalQuestions, quizName, time, answers }) => {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState('all');

//   const formatTime = (seconds) => {
//     if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = Math.floor(seconds % 60);
//     return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   const formattedResponses = answers.map(answer => ({
//     qs: {
//       question_text: answer.question,
//       correct_choice: answer.correctAnswer,
//       rationale: answer.rationale,
//       subject: answer.subject || 'Unknown',
//       choices: answer.choices || []
//     },
//     user_answer: answer.selectedAnswer,
//     is_bookmarked: answer.isBookmarked,
//     feedback: answer.feedback
//   }));

//   // Calculate scores per subject
//   const subjectScores = formattedResponses.reduce((acc, response) => {
//     const subject = response.qs.subject;
//     if (!acc[subject]) {
//       acc[subject] = { correct: 0, total: 0 };
//     }
//     acc[subject].total += 1;
//     if (response.user_answer === response.qs.correct_choice) {
//       acc[subject].correct += 1;
//     }
//     return acc;
//   }, {});

//   // Calculate the overall score percentage
//   const overallScorePercentage = Math.round((score / totalQuestions) * 100);

//   // Determine progress bar class based on score
//   const progressBarClass = overallScorePercentage > 80 
//     ? "progress progress-success w-56" 
//     : overallScorePercentage > 70 
//       ? "progress progress-primary w-56" 
//       : overallScorePercentage <= 60 
//         ? "progress progress-error w-56" 
//         : "progress w-56";

//   return (
//     <>
//       <Suspense>
//         <Header />
//         <div className="min-h-screen bg-gray-100">
//           <div className="py-12 px-4 sm:px-6 lg:px-8">
//             <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
//               <div className="px-4 py-5 sm:p-6">
//                 <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{quizName} Results</h2>
//                 <div className="text-center mb-6">
//                   <p className="text-4xl font-bold text-blue-600">
//                     {score} / {totalQuestions}
//                   </p>
//                   <p className="text-gray-500 mt-2">Time taken: {formatTime(time)}</p>
//                   <div className="mt-4">
//                     <div
//                       className="radial-progress bg-primary text-primary-content border-primary border-4"
//                       style={{ "--value": overallScorePercentage }}
//                       role="progressbar"
//                     >
//                       {overallScorePercentage}%
//                     </div>
//                   </div>
//                 </div>

//                 {/* Subject-wise scores */}
//                 <div className="mb-6">
//                   <h3 className="text-xl font-semibold mb-3">Scores by Subject</h3>
//                   {Object.entries(subjectScores).map(([subject, { correct, total }]) => (
//                     <div key={subject} className="flex justify-between items-center mb-2">
//                       <span>{subject}:</span>
//                       <div className="flex items-center">
//                         <span className="mr-2">{correct}/{total}</span>
//                         <progress className="progress progress-info w-32" value={(correct / total) * 100} max="100"></progress>
//                         <span className="ml-2">({Math.round((correct / total) * 100)}%)</span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-6 text-center">
//                   <button
//                     onClick={() => setActiveTab('review')}
//                     className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                   >
//                     Review your answers
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//           {activeTab === 'review' && (
//             <Review responses={formattedResponses} activeTab="all" />
//           )}
//         </div>
//       </Suspense>
//     </>
//   );
// };

// export default Score;
'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Review from './Review';
import { Suspense, useState } from 'react';

const Score = ({ score, totalQuestions, quizName, time, answers }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');

  const formatTime = (seconds) => {
    if (typeof seconds !== 'number' || isNaN(seconds)) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formattedResponses = answers.map(answer => ({
    qs: {
      question_text: answer.question,
      correct_choice: answer.correctAnswer,
      rationale: answer.rationale,
      subject: answer.subject || 'Unknown',
      choices: answer.choices || []
    },
    user_answer: answer.selectedAnswer,
    is_bookmarked: answer.isBookmarked,
    feedback: answer.feedback
  }));

  // Calculate scores per subject
  const subjectScores = formattedResponses.reduce((acc, response) => {
    const subject = response.qs.subject;
    if (!acc[subject]) {
      acc[subject] = { correct: 0, total: 0 };
    }
    acc[subject].total += 1;
    if (response.user_answer === response.qs.correct_choice) {
      acc[subject].correct += 1;
    }
    return acc;
  }, {});

  // Calculate the overall score percentage
  const overallScorePercentage = Math.round((score / totalQuestions) * 100);

  // Determine progress bar class based on score
  const progressBarClass = overallScorePercentage > 80 
    ? "progress progress-success w-56" 
    : overallScorePercentage > 70 
      ? "progress progress-primary w-56" 
      : overallScorePercentage <= 60 
        ? "progress progress-error w-56" 
        : "progress w-56";

  return (
    <>
      <Suspense>
        <Header />
        <div className="min-h-screen bg-gray-100">
          <div className="py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">{quizName} Results</h2>
                <div className="text-center mb-6">
                  <p className="text-4xl font-bold text-blue-600">
                    {score} / {totalQuestions}
                  </p>
                  <p className="text-gray-500 mt-2">Time taken: {formatTime(time)}</p>
                  <div className="mt-4">
                    <div
                      className="radial-progress bg-primary text-primary-content border-primary border-4"
                      style={{ "--value": overallScorePercentage }}
                      role="progressbar"
                    >
                      {overallScorePercentage}%
                    </div>
                  </div>
                </div>

                {/* Subject-wise scores */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-3">Scores by Subject</h3>
                  {Object.entries(subjectScores).map(([subject, { correct, total }]) => (
                    <div key={subject} className="flex justify-between items-center mb-2">
                      <span>{subject}:</span>
                      <div className="flex items-center">
                        <span className="mr-2">{correct}/{total}</span>
                        <progress className="progress progress-info w-32" value={(correct / total) * 100} max="100"></progress>
                        <span className="ml-2">({Math.round((correct / total) * 100)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Review your answers
                  </button>
                </div>
              </div>
            </div>
          </div>
          {activeTab === 'review' && (
            <Review responses={formattedResponses} activeTab="all" />
          )}
        </div>
      </Suspense>
    </>
  );
};

export default Score;
