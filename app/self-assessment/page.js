// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import Header from '@/components/Header';
// import UpgradeModal from '@/components/UpgradeModal';
// import Wall from '@/components/Wall';
// import QuizComponent from '@/components/QuizComponent';
// import blueprints from '@/app/blueprints';
// import { Suspense } from 'react';
// export default function SelfAssessmentPage() {
//   const [exams, setExams] = useState([]);
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [questions, setQuestions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [examStarted, setExamStarted] = useState(false);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [user, setUser] = useState(null);
//   const router = useRouter();
//   const supabase = createClientComponentClient();

//   useEffect(() => {
//     const fetchUserAndExams = async () => {
//       try {
//         const { data: { user }, error: userError } = await supabase.auth.getUser();
//         if (userError) throw userError;

//         setUser(user);

//         const { data, error } = await supabase
//           .from('qtable')
//           .select('examname')
//           .order('examname');

//         if (error) {
//           console.error('Error fetching exams:', error);
//         } else {
//           const uniqueExams = [...new Set(data.map(item => item.examname))];
//           setExams(uniqueExams);
//         }
//       } catch (error) {
//         console.error('Error fetching user or exams:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUserAndExams();
//   }, [supabase]);

//   const handleExamSelect = (exam) => {
//     setSelectedExam(exam);
//   };

//   const fetchQuestionsForExam = async (examName) => {
//     const { data, error } = await supabase
//       .from('qtable')
//       .select('*')
//       .eq('examname', examName);

//     if (error) {
//       console.error('Error fetching questions:', error);
//       return [];
//     }

//     const blueprint = blueprints[examName] || {};
//     const questionsBySubject = data.reduce((acc, question) => {
//       if (!acc[question.subject]) {
//         acc[question.subject] = [];
//       }
//       acc[question.subject].push(question);
//       return acc;
//     }, {});

//     const selectedQuestions = Object.entries(blueprint).flatMap(([subject, weight]) => {
//       const subjectQuestions = questionsBySubject[subject] || [];
//       const numQuestions = Math.floor((weight / 100) * 200);
//       return subjectQuestions.slice(0, numQuestions);
//     }).slice(0, 200).map(question => ({
//       ...question,
//       userAnswer: null,
//       isBookmarked: false,
//     }));

//     return selectedQuestions;
//   };

//   const handleStartExam = async () => {
//     if (selectedExam) {
//       const examQuestions = await fetchQuestionsForExam(selectedExam);
//       setQuestions(examQuestions);
//       setExamStarted(true);
//     }
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//     router.push('/pricing');
//   };

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (examStarted) {
//     return (
//       <Wall examName={selectedExam}>
//         <QuizComponent 
//           questions={questions} 
//           quizName={selectedExam}
//           testTaker={user ? user.user_metadata?.full_name || "Test Taker" : "Test Taker"}
//           isSelfExam={true}
//         />
//       </Wall>
//     );
//   }

//   return (

//     <Suspense>
//     <div>


     
//       <Header />
//       <UpgradeModal isOpen={isModalOpen} onClose={closeModal} />
//       <div className="container mx-auto p-4">
//         <h1 className="text-3xl font-bold mb-4">Self Assessment</h1>
        
//         {!selectedExam ? (
//           <>
//             <p className="mb-4">Select an exam to start your self-assessment:</p>
//             <ul className="space-y-2">
//               {exams.map((exam, index) => (
//                 <li 
//                   key={index} 
//                   className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover-border-black cursor-pointer"
//                   onClick={() => handleExamSelect(exam)}
//                 >
//                   {exam}
//                 </li>
//               ))}
//             </ul>
//           </>
//         ) : (
//           <Wall examName={selectedExam}>
//             <>
//               <h2 className="text-2xl font-semibold mb-4">Exam Instructions for {selectedExam}</h2>
//               <p className="mb-4">This is a self-assessment exam. You will have 3 hours to complete it once you start.</p>
//               <p className="mb-4">Instructions:</p>
//               <ul className="list-disc list-inside mb-4">
//                 <li>You cannot pause the exam once started.</li>
//                 <li>Answer all questions to the best of your ability.</li>
//                 <li>You can review and change your answers within the time limit.</li>
//                 <li>Your results will be available immediately after completion.</li>
//                 <li>This is a fresh assessment - no previous answers or bookmarks will be shown.</li>
//               </ul>
//               <div className="mb-4">
//                 <h3 className="text-lg font-semibold">Blueprint:</h3>
//                 <ul className="list-disc list-inside">
//                   {Object.entries(blueprints[selectedExam] || {}).map(([subject, weight]) => (
//                     <li key={subject}>{subject}: {weight}%</li>
//                   ))}
//                 </ul>
//               </div>
//               <button 
//                 onClick={handleStartExam}
//                 className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//               >
//                 Start Exam
//               </button>
//             </>
//           </Wall>
//         )}
//       </div>
//     </div>
//     </Suspense>
//   );
// }
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/components/Header';
import UpgradeModal from '@/components/UpgradeModal';
import QuizComponent from '@/components/QuizComponent';
import blueprints from '@/app/blueprints';
import { Suspense } from 'react';
import { CheckCircle2, ChevronRight, GraduationCap, Timer } from 'lucide-react';

export default function SelfAssessmentPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchUserAndExams = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        setUser(user);

        const { data: examsData, error: examsError } = await supabase
          .from('user_data')
          .select('examname')
          .eq('user_id', user.id);

        if (examsError) {
          console.error('Error fetching exams:', examsError);
        } else {
          const uniqueExams = [...new Set(examsData.map(item => item.examname))];
          setExams(uniqueExams);
        }
      } catch (error) {
        console.error('Error fetching user or exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndExams();
  }, [supabase]);

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
  };

  const fetchQuestionsForExam = async (examName) => {
    try {
      const { data, error } = await supabase
        .from('qs')
        .select('*')
        .eq('examname', examName)
        .order('id', { ascending: true }) // Ensure consistent ordering
        .limit(200); // Limit to 200 questions

      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

      console.log('Questions data:', data); // Log the fetched questions data

      return data.map(question => ({
        ...question,
        userAnswer: null,
        isBookmarked: false,
      }));
    } catch (err) {
      console.error('Error in fetchQuestionsForExam:', err);
      return [];
    }
  };

  const handleStartExam = async () => {
    if (selectedExam) {
      const examQuestions = await fetchQuestionsForExam(selectedExam);
      setQuestions(examQuestions);
      setExamStarted(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
        <Header />
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-8 text-center font-extrabold text-[#777]" style={{ boxShadow: "0 4px 0 #E5E5E5" }}>
            Loading self assessment...
          </div>
        </div>
      </div>
    );
  }

  if (examStarted) {
    return (
      <QuizComponent 
        questions={questions} 
        quizName={selectedExam}
        testTaker={user ? user.user_metadata?.full_name || "Test Taker" : "Test Taker"}
        isSelfExam={true}
      />
    );
  }

  return (
    <Suspense>
      <div className="min-h-screen bg-[#FAFAFA] text-[#3C3C3C]">
        <Header />
        <UpgradeModal isOpen={isModalOpen} onClose={closeModal} />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <section className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6 md:p-8" style={{ boxShadow: "0 5px 0 #E5E5E5" }}>
            <span className="inline-flex items-center gap-2 rounded-full border-2 border-[#E7F8D6] bg-[#F3FBE9] px-4 py-1.5 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
              <GraduationCap className="h-4 w-4" strokeWidth={2.5} />
              Self exam
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
              Self Assessment
            </h1>
            <p className="mt-3 max-w-2xl text-base font-bold leading-7 text-[#777]">
              Build a fresh exam session from your active DrNote access and review your readiness before test day.
            </p>
          </section>
          
          {!selectedExam ? (
            <section className="mt-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold">Choose your exam</h2>
                  <p className="mt-1 text-sm font-bold text-[#777]">Available for all exams in your account.</p>
                </div>
                <span className="inline-flex w-fit rounded-full bg-[#E7F8D6] px-4 py-1 text-xs font-extrabold uppercase tracking-wide text-[#58A700]">
                  {exams.length} ready
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {exams.map((exam, index) => (
                  <button
                    type="button"
                    key={index} 
                    className="group flex items-center justify-between rounded-2xl border-2 border-[#E5E5E5] bg-white p-5 text-left transition-transform hover:-translate-y-1"
                    style={{ boxShadow: "0 4px 0 #E5E5E5" }}
                    onClick={() => handleExamSelect(exam)}
                  >
                    <span>
                      <span className="block text-2xl font-extrabold">{exam}</span>
                      <span className="mt-1 block text-sm font-bold text-[#777]">Start a 200-question self exam</span>
                    </span>
                    <ChevronRight className="h-5 w-5 text-[#58CC02] transition group-hover:translate-x-1" strokeWidth={3} />
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6" style={{ boxShadow: "0 4px 0 #E5E5E5" }}>
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#DDF4FE] text-[#1CB0F6]">
                    <Timer className="h-6 w-6" strokeWidth={2.5} />
                  </span>
                  <div>
                    <h2 className="text-2xl font-extrabold">Exam Instructions for {selectedExam}</h2>
                    <p className="text-sm font-bold text-[#777]">You will have 3 hours once you start.</p>
                  </div>
                </div>
                <div className="mt-6 space-y-3 text-sm font-bold text-[#555]">
                  {[
                    'You cannot pause the exam once started.',
                    'Answer all questions to the best of your ability.',
                    'You can review and change your answers within the time limit.',
                    'Your results will be available immediately after completion.',
                    'This is a fresh assessment - no previous answers or bookmarks will be shown.',
                  ].map((instruction) => (
                    <div key={instruction} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#58CC02]" strokeWidth={2.5} />
                      <span>{instruction}</span>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={handleStartExam}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-[#58CC02] px-8 py-4 text-base font-extrabold uppercase tracking-wide text-white transition hover:brightness-105 active:translate-y-1"
                  style={{ boxShadow: "0 4px 0 #46A302" }}
                >
                  Start Exam
                  <ChevronRight className="h-5 w-5" strokeWidth={3} />
                </button>
              </div>

              <div className="rounded-2xl border-2 border-[#E5E5E5] bg-white p-6" style={{ boxShadow: "0 4px 0 #E5E5E5" }}>
                <h3 className="text-lg font-extrabold">Blueprint</h3>
                <div className="mt-4 space-y-3">
                  {Object.entries(blueprints[selectedExam] || {}).map(([subject, weight]) => (
                    <div key={subject} className="rounded-2xl bg-[#FAFAFA] p-3">
                      <div className="flex items-center justify-between gap-4 text-sm font-extrabold">
                        <span>{subject}</span>
                        <span className="text-[#58A700]">{weight}%</span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#E5E5E5]">
                        <div className="h-full rounded-full bg-[#58CC02]" style={{ width: `${weight}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </Suspense>
  );
}
