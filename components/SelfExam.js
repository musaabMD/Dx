// 'use client';

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// import { useRouter } from 'next/navigation';
// import QuizHeader from './QuizHeader';
// import Score from './Score';
// import SubmitExam from './SubmitExam';
// import Sidebar from './Sidebar';
// import Explanation from './Explanation';
// import Feedback from './Feedback';
// import QuizFooter from './QuizFooter';

// const SelfExam = ({ questions = [], examName, testTaker }) => {
//   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
//   const [answers, setAnswers] = useState(new Array(questions.length).fill(null));
//   const [quizEnded, setQuizEnded] = useState(false);
//   const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
//   const [flaggedQuestions, setFlaggedQuestions] = useState([]);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const [showExplanation, setShowExplanation] = useState(false);
//   const [crossedOutChoices, setCrossedOutChoices] = useState({});
//   const [feedbacks, setFeedbacks] = useState({});
//   const [timeLeft, setTimeLeft] = useState(3 * 60 * 60); // 3 hours in seconds
//   const timerRef = useRef(null);
//   const supabase = createClientComponentClient();
//   const router = useRouter();

//   useEffect(() => {
//     timerRef.current = setInterval(() => {
//       setTimeLeft((prevTime) => {
//         if (prevTime <= 1) {
//           clearInterval(timerRef.current);
//           endExam();
//           return 0;
//         }
//         return prevTime - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timerRef.current);
//   }, []);

//   const navigateQuestion = useCallback((direction) => {
//     const newIndex = currentQuestionIndex + direction;
//     if (newIndex >= 0 && newIndex < questions.length) {
//       setCurrentQuestionIndex(newIndex);
//       setShowExplanation(false);
//     }
//   }, [currentQuestionIndex, questions.length]);

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === 'ArrowLeft') {
//         navigateQuestion(-1);
//       } else if (event.key === 'ArrowRight') {
//         navigateQuestion(1);
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [navigateQuestion]);

//   const saveUserResponse = async (questionId, userAnswer, isBookmarked) => {
//     const { data: { user } } = await supabase.auth.getUser();
//     const { error } = await supabase
//       .from('user_responses')
//       .upsert({
//         user_id: user.id,
//         question_id: questionId,
//         user_answer: userAnswer,
//         is_bookmarked: isBookmarked
//       }, { onConflict: ['user_id', 'question_id'] });
  
//     if (error) {
//       console.error('Error saving user response:', error);
//     }
//   };

//   const handleAnswer = async (selectedOption) => {
//     setAnswers(prevAnswers => {
//       const newAnswers = [...prevAnswers];
//       newAnswers[currentQuestionIndex] = selectedOption;
//       return newAnswers;
//     });
//     setShowExplanation(true);
//     await saveUserResponse(
//       questions[currentQuestionIndex].id, 
//       selectedOption, 
//       flaggedQuestions.includes(currentQuestionIndex)
//     );

//     if (currentQuestionIndex < questions.length - 1) {
//       setCurrentQuestionIndex(prevIndex => prevIndex + 1);
//     }
//   };

//   const handleSubmit = () => {
//     setIsSubmitModalOpen(true);
//   };

//   const endExam = () => {
//     clearInterval(timerRef.current);
//     setQuizEnded(true);
//     setIsSubmitModalOpen(false);
//     const scoresBySubject = calculateScoresBySubject();
//     const overallScore = calculateOverallScore();
//     saveExamResults(scoresBySubject, overallScore);
//   };

//   const calculateScoresBySubject = () => {
//     const subjectScores = {};
//     questions.forEach((question, index) => {
//       const subject = question.subject || 'Unknown';
//       if (!subjectScores[subject]) {
//         subjectScores[subject] = { correct: 0, total: 0 };
//       }
//       subjectScores[subject].total += 1;
//       if (answers[index] === question.correct_choice) {
//         subjectScores[subject].correct += 1;
//       }
//     });
//     return subjectScores;
//   };

//   const calculateOverallScore = () => {
//     const correctAnswers = answers.filter((answer, index) => answer === questions[index].correct_choice).length;
//     return (correctAnswers / questions.length) * 100;
//   };

//   const saveExamResults = async (scoresBySubject, overallScore) => {
//     const { data: { user } } = await supabase.auth.getUser();
//     const { error } = await supabase
//       .from('self_assessment_results')
//       .insert({
//         user_id: user.id,
//         exam_name: examName,
//         scores_by_subject: scoresBySubject,
//         overall_score: overallScore,
//         completed_at: new Date().toISOString(),
//       });

//     if (error) {
//       console.error('Error saving exam results:', error);
//     }
//   };

//   const toggleBookmark = async () => {
//     const newFlaggedQuestions = flaggedQuestions.includes(currentQuestionIndex)
//       ? flaggedQuestions.filter(q => q !== currentQuestionIndex)
//       : [...flaggedQuestions, currentQuestionIndex];
    
//     setFlaggedQuestions(newFlaggedQuestions);
    
//     await saveUserResponse(
//       questions[currentQuestionIndex].id, 
//       answers[currentQuestionIndex], 
//       newFlaggedQuestions.includes(currentQuestionIndex)
//     );
//   };

//   const toggleCrossOut = (letter) => {
//     setCrossedOutChoices(prev => ({
//       ...prev,
//       [currentQuestionIndex]: {
//         ...prev[currentQuestionIndex],
//         [letter]: !prev[currentQuestionIndex]?.[letter]
//       }
//     }));
//   };

//   const handleFeedbackSubmit = async (feedback) => {
//     const { data: { user } } = await supabase.auth.getUser();

//     const { error } = await supabase
//       .from('feedback')
//       .insert({
//         question_id: feedback.questionId,
//         feedback_type: feedback.feedbackType,
//         suggested_answer: feedback.suggestedAnswer || null,
//         feedback_text: feedback.feedbackText,
//         user_id: user.id
//       });

//     if (error) {
//       console.error('Error submitting feedback:', error);
//     } else {
//       setFeedbacks(prev => ({
//         ...prev,
//         [feedback.questionId]: [
//           ...(prev[feedback.questionId] || []),
//           feedback
//         ]
//       }));
//     }
//   };

//   if (quizEnded) {
//     const scoresBySubject = calculateScoresBySubject();
//     const overallScore = calculateOverallScore();

//     return (
//       <Score 
//         score={overallScore}
//         totalQuestions={questions.length}
//         quizName={examName}
//         time={3 * 60 * 60 - timeLeft}
//         answers={answers.map((answer, index) => ({
//           question: questions[index].question_text,
//           selectedAnswer: answer,
//           correctAnswer: questions[index].correct_choice,
//           isCorrect: answer === questions[index].correct_choice,
//           rationale: questions[index].rationale,
//           isBookmarked: flaggedQuestions.includes(index),
//           subject: questions[index].subject || 'Unknown',
//           feedback: feedbacks[questions[index].id]
//         }))}
//         scoresBySubject={scoresBySubject}
//       />
//     );
//   }

//   if (questions.length === 0) {
//     return <div className="bg-white text-black p-8">Loading questions...</div>;
//   }

//   const currentQuestion = questions[currentQuestionIndex];

//   if (!currentQuestion) {
//     return <div className="bg-white text-black p-8">Error loading question. Please try again.</div>;
//   }

//   const options = ['A', 'B', 'C', 'D', 'E', 'F']
//     .map(letter => ({ letter, text: currentQuestion[`option_${letter.toLowerCase()}`] }))
//     .filter(option => option.text !== null);

//   return (
//     <div className="flex flex-col min-h-screen bg-white">
//       <QuizHeader 
//         testTaker={testTaker}
//         quizName={examName}
//         currentQuestionIndex={currentQuestionIndex}
//         totalQuestions={questions.length}
//         onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//         timeRemaining={timeLeft}
//       />
//       <Sidebar 
//         questions={questions}
//         currentQuestion={currentQuestionIndex}
//         setCurrentQuestion={(index) => {
//           setCurrentQuestionIndex(index);
//           setShowExplanation(false);
//         }}
//         flaggedQuestions={flaggedQuestions}
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//       />
//       <div className="flex-grow p-8 pb-20">
//         <div className="mb-4">
//           <p className="text-4xl text-black font-semibold">{currentQuestion.question_text}</p>
//         </div>
//         <div className="space-y-4">
//           {options.map(({ letter, text }) => {
//             const isSelected = answers[currentQuestionIndex] === letter;
//             const isCorrect = letter === currentQuestion.correct_choice;
//             const isCrossedOut = crossedOutChoices[currentQuestionIndex]?.[letter];
//             let buttonClass = "block w-full text-left p-4 text-3xl border-2 transition-colors ";
            
//             if (isSelected) {
//               buttonClass += isCorrect 
//                 ? "bg-[#e6fff9] border-[#009875] text-[#009875]" 
//                 : "bg-[#ffeded] border-[#DD0000] text-[#DD0000]";
//             } else {
//               buttonClass += "bg-slate-100 border-black hover:bg-slate-200";
//             }

//             if (isCrossedOut) {
//               buttonClass += " line-through";
//             }

//             return (
//               <button
//                 key={letter}
//                 onClick={() => handleAnswer(letter)}
//                 className={buttonClass}
//               >
//                 <span 
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     toggleCrossOut(letter);
//                   }}
//                   className="cursor-pointer"
//                 >
//                    {letter}. {text}
//                 </span>
//               </button>
//             );
//           })}
//         </div>
//         {showExplanation && (
//           <>
//             <Explanation 
//               rationale={currentQuestion.rationale}
//               isVisible={showExplanation}
//             />
//             <Feedback 
//               questionId={currentQuestion.id}
//               currentAnswer={currentQuestion.correct_choice}
//               options={options}
//               onSubmit={handleFeedbackSubmit}
//             />
//           </>
//         )}
//         <SubmitExam 
//           isOpen={isSubmitModalOpen}
//           onClose={() => setIsSubmitModalOpen(false)}
//           onSubmit={endExam}
//           unansweredQuestions={answers.filter(a => a === null).length}
//         />
//       </div>
//       <QuizFooter 
//         onPrevious={() => navigateQuestion(-1)}
//         onNext={() => navigateQuestion(1)}
//         onSubmit={handleSubmit}
//         currentQuestionIndex={currentQuestionIndex}
//         totalQuestions={questions.length}
//         onToggleBookmark={toggleBookmark}
//         isBookmarked={flaggedQuestions.includes(currentQuestionIndex)}
//       />
//     </div>
//   );
// };

// export default SelfExam;

'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import QuizComponent from '@/components/QuizComponent';
import { Suspense } from 'react';
const SelfAssessmentExam = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testTaker, setTestTaker] = useState('');
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();
  const { examName } = useParams();

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setTestTaker(user.user_metadata?.full_name || "Test Taker");

        // Fetch questions for the specific exam
        const { data: questionsData, error: questionsError } = await supabase
          .from('qtable')
          .select('*')
          .eq('examname', examName)
          .order('id', { ascending: true });
        if (questionsError) throw questionsError;

        // Fetch user responses for this exam
        const { data: userResponsesData, error: userResponsesError } = await supabase
          .from('user_responses')
          .select('*')
          .eq('user_id', user.id);
        if (userResponsesError) throw userResponsesError;

        // Combine questions with user responses
        const combinedQuestions = questionsData.map(question => {
          const userResponse = userResponsesData.find(response => response.question_id === question.id);
          return {
            ...question,
            userAnswer: userResponse ? userResponse.user_answer : null,
            isBookmarked: userResponse ? userResponse.is_bookmarked : false,
          };
        });

        setQuestions(combinedQuestions);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load exam data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [supabase, examName]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading questions...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
  }

  if (questions.length === 0) {
    return <div className="flex justify-center items-center h-screen">No questions found for this exam.</div>;
  }

  return (
    <>
    <Suspense>


   
    <div className="w-full">
      <QuizComponent
        questions={questions}
        quizName={examName}
        testTaker={testTaker}
        isSelfExam={true}
      />
    </div>
    </Suspense>
    </>
  );
};

export default SelfAssessmentExam;