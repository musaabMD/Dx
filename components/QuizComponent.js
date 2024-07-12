// // // 'use client';

// // // import React, { useState, useRef, useEffect, useCallback } from 'react';
// // // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // // import QuizHeader from './QuizHeader';
// // // import Score from './Score';
// // // import SubmitExam from './SubmitExam';
// // // import Sidebar from './Sidebar';
// // // import Explanation from './Explanation';
// // // import Feedback from './Feedback';
// // // import QuizFooter from './QuizFooter';

// // // const QuizComponent = ({ questions, quizName, testTaker, isSelfExam = false }) => {
// // //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// // //   const [score, setScore] = useState(0);
// // //   const [quizEnded, setQuizEnded] = useState(false);
// // //   const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
// // //   const [answers, setAnswers] = useState(questions.map(q => q.userAnswer || null));
// // //   const [flaggedQuestions, setFlaggedQuestions] = useState(questions.filter(q => q.isBookmarked).map((_, index) => index));
// // //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// // //   const [showExplanation, setShowExplanation] = useState(false);
// // //   const [crossedOutChoices, setCrossedOutChoices] = useState({});
// // //   const [feedbacks, setFeedbacks] = useState({});
// // //   const timerRef = useRef(null);
// // //   const supabase = createClientComponentClient();

// // //   const navigateQuestion = useCallback((direction) => {
// // //     const newIndex = currentQuestionIndex + direction;
// // //     if (newIndex >= 0 && newIndex < questions.length) {
// // //       setCurrentQuestionIndex(newIndex);
// // //       setShowExplanation(false);
// // //     }
// // //   }, [currentQuestionIndex, questions.length]);

// // //   useEffect(() => {
// // //     const handleKeyDown = (event) => {
// // //       if (event.key === 'ArrowLeft') {
// // //         navigateQuestion(-1);
// // //       } else if (event.key === 'ArrowRight') {
// // //         navigateQuestion(1);
// // //       }
// // //     };

// // //     window.addEventListener('keydown', handleKeyDown);
// // //     return () => window.removeEventListener('keydown', handleKeyDown);
// // //   }, [navigateQuestion]);

// // //   const saveUserResponse = async (questionId, userAnswer, isBookmarked) => {
// // //     if (isSelfExam) return; // Don't save responses for self-assessment

// // //     const { data: { user } } = await supabase.auth.getUser();
// // //     console.log('Saving user response:', { user_id: user.id, question_id: questionId, user_answer: userAnswer, is_bookmarked: isBookmarked });
// // //     const { data, error } = await supabase
// // //       .from('user_responses')
// // //       .upsert({
// // //         user_id: user.id,
// // //         question_id: questionId,
// // //         user_answer: userAnswer,
// // //         is_bookmarked: isBookmarked
// // //       }, { onConflict: ['user_id', 'question_id'] });
  
// // //     if (error) {
// // //       console.error('Error saving user response:', error);
// // //       console.error('Error details:', JSON.stringify(error, null, 2));
// // //     } else {
// // //       console.log('User response saved successfully:', data);
// // //     }
// // //   };

// // //   const updateChoiceVotes = async (questionId, choice) => {
// // //     console.log('Starting updateChoiceVotes function');
// // //     console.log('Inputs:', { questionId, choice });

// // //     if (!questionId || typeof questionId !== 'string') {
// // //       console.error('Invalid questionId:', questionId);
// // //       return;
// // //     }

// // //     if (!choice || typeof choice !== 'string' || !['A', 'B', 'C', 'D', 'E', 'F'].includes(choice.toUpperCase())) {
// // //       console.error('Invalid choice:', choice);
// // //       return;
// // //     }

// // //     try {
// // //       console.log('Calling Supabase RPC function');
// // //       const { data, error } = await supabase.rpc('increment_choice_votes', {
// // //         q_id: questionId,
// // //         choice: choice.toUpperCase()
// // //       });

// // //       console.log('Supabase RPC response:', { data, error });

// // //       if (error) {
// // //         console.error('Supabase RPC error:', error);
// // //         console.error('Error code:', error.code);
// // //         console.error('Error message:', error.message);
// // //         console.error('Error details:', error.details);
// // //         throw error;
// // //       }

// // //       console.log('Choice votes updated successfully');
// // //       return data;
// // //     } catch (error) {
// // //       console.error('Caught error in updateChoiceVotes:', error);
// // //       if (error.response) {
// // //         console.error('Error response:', error.response);
// // //       }
// // //       throw error;
// // //     }
// // //   };

// // //   const handleAnswer = async (selectedOption) => {
// // //     setAnswers(prevAnswers => {
// // //       const newAnswers = [...prevAnswers];
// // //       newAnswers[currentQuestionIndex] = selectedOption;
// // //       return newAnswers;
// // //     });
// // //     if (!isSelfExam) {
// // //       setShowExplanation(true);
// // //       await saveUserResponse(
// // //         questions[currentQuestionIndex].id, 
// // //         selectedOption, 
// // //         flaggedQuestions.includes(currentQuestionIndex)
// // //       );
// // //       await updateChoiceVotes(questions[currentQuestionIndex].id, selectedOption);
// // //     }
// // //   };

// // //   const handleSubmit = () => {
// // //     setIsSubmitModalOpen(true);
// // //   };

// // //   const endQuiz = useCallback(() => {
// // //     const finalScore = answers.reduce((acc, answer, index) => {
// // //       if (answer === questions[index].correct_choice) {
// // //         return acc + 1;
// // //       }
// // //       return acc;
// // //     }, 0);
// // //     setScore(finalScore);
// // //     setQuizEnded(true);
// // //     setIsSubmitModalOpen(false);
// // //   }, [answers, questions]);

// // //   const toggleBookmark = async () => {
// // //     const newFlaggedQuestions = flaggedQuestions.includes(currentQuestionIndex)
// // //       ? flaggedQuestions.filter(q => q !== currentQuestionIndex)
// // //       : [...flaggedQuestions, currentQuestionIndex];
    
// // //     setFlaggedQuestions(newFlaggedQuestions);
    
// // //     if (!isSelfExam) {
// // //       await saveUserResponse(
// // //         questions[currentQuestionIndex].id, 
// // //         answers[currentQuestionIndex], 
// // //         newFlaggedQuestions.includes(currentQuestionIndex)
// // //       );
// // //     }
// // //   };

// // //   const toggleCrossOut = (letter) => {
// // //     setCrossedOutChoices(prev => ({
// // //       ...prev,
// // //       [currentQuestionIndex]: {
// // //         ...prev[currentQuestionIndex],
// // //         [letter]: !prev[currentQuestionIndex]?.[letter]
// // //       }
// // //     }));
// // //   };

// // //   const handleFeedbackSubmit = async (feedback) => {
// // //     if (isSelfExam) return; // Don't submit feedback for self-assessment

// // //     console.log("Feedback submitted:", feedback);

// // //     const { data: { user } } = await supabase.auth.getUser();

// // //     const { data, error } = await supabase
// // //       .from('feedback')
// // //       .insert({
// // //         question_id: feedback.questionId,
// // //         feedback_type: feedback.feedbackType,
// // //         suggested_answer: feedback.suggestedAnswer || null,
// // //         feedback_text: feedback.feedbackText,
// // //         user_id: user.id
// // //       });

// // //     if (error) {
// // //       console.error('Error submitting feedback:', error);
// // //     } else {
// // //       console.log('Feedback submitted successfully:', data);
// // //       setFeedbacks(prev => ({
// // //         ...prev,
// // //         [feedback.questionId]: [
// // //           ...(prev[feedback.questionId] || []),
// // //           feedback
// // //         ]
// // //       }));
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     if (currentQuestionIndex === questions.length - 1) {
// // //       setIsSubmitModalOpen(true);
// // //     }
// // //   }, [currentQuestionIndex, questions.length]);

// // //   if (quizEnded) {
// // //     return <Score 
// // //       score={score} 
// // //       totalQuestions={questions.length} 
// // //       quizName={quizName}
// // //       time={timerRef.current?.getTime()} 
// // //       answers={answers.map((answer, index) => ({
// // //         question: questions[index].question_text,
// // //         selectedAnswer: answer,
// // //         correctAnswer: questions[index].correct_choice,
// // //         isCorrect: answer === questions[index].correct_choice,
// // //         rationale: questions[index].rationale,
// // //         isBookmarked: flaggedQuestions.includes(index),
// // //         subject: questions[index].subject || 'Unknown',
// // //         feedback: feedbacks[questions[index].id]
// // //       }))}
// // //     />;
// // //   }

// // //   if (questions.length === 0) {
// // //     return <div className="bg-white text-black p-8">Loading questions...</div>;
// // //   }

// // //   const currentQuestion = questions[currentQuestionIndex];

// // //   if (!currentQuestion) {
// // //     return <div className="bg-white text-black p-8">Error loading question. Please try again.</div>;
// // //   }

// // //   const options = ['A', 'B', 'C', 'D', 'E', 'F']
// // //     .map(letter => ({ letter, text: currentQuestion[`option_${letter.toLowerCase()}`] }))
// // //     .filter(option => option.text !== null);

// // //   return (
// // //     <div className="flex flex-col min-h-screen bg-white">
// // //       <QuizHeader 
// // //         testTaker={testTaker}
// // //         quizName={quizName}
// // //         timerRef={timerRef}
// // //         currentQuestionIndex={currentQuestionIndex}
// // //         totalQuestions={questions.length}
// // //         onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
// // //       />
// // //       <Sidebar 
// // //         questions={questions}
// // //         currentQuestion={currentQuestionIndex}
// // //         setCurrentQuestion={(index) => {
// // //           setCurrentQuestionIndex(index);
// // //           setShowExplanation(false);
// // //         }}
// // //         flaggedQuestions={flaggedQuestions}
// // //         isOpen={isSidebarOpen}
// // //         onClose={() => setIsSidebarOpen(false)}
// // //       />
// // //       <div className="flex-grow p-8 pb-20">
// // //         <div className="mb-4">
// // //           <p className="text-4xl text-black font-semibold">{currentQuestion.question_text}</p>
// // //           {currentQuestion.question_image_url && (
// // //             <img src={currentQuestion.question_image_url} alt="Question" className="mt-4 max-w-full h-auto" />
// // //           )}
// // //         </div>
// // //         <div className="space-y-4">
// // //           {options.map(({ letter, text }) => {
// // //             const isSelected = answers[currentQuestionIndex] === letter;
// // //             const isCorrect = letter === currentQuestion.correct_choice;
// // //             const isCrossedOut = crossedOutChoices[currentQuestionIndex]?.[letter];
            
// // //             let buttonClass = "block w-full text-left p-4 text-3xl border-2 transition-colors ";
            
// // //             if (isSelected) {
// // //               if (isSelfExam) {
// // //                 buttonClass += "bg-blue-200 border-blue-500 "; // Show selection without indicating correctness
// // //               } else {
// // //                 buttonClass += isCorrect 
// // //                   ? "bg-[#e6fff9] border-[#009875] text-[#009875]" 
// // //                   : "bg-[#ffeded] border-[#DD0000] text-[#DD0000]";
// // //               }
// // //             } else {
// // //               buttonClass += "bg-slate-100 border-black hover:bg-slate-200";
// // //             }

// // //             if (isCrossedOut) {
// // //               buttonClass += " line-through";
// // //             }

// // //             return (
// // //               <button
// // //                 key={letter}
// // //                 onClick={() => handleAnswer(letter)}
// // //                 className={buttonClass}
// // //               >
// // //                 <span 
// // //                   onClick={(e) => {
// // //                     e.stopPropagation();
// // //                     toggleCrossOut(letter);
// // //                   }}
// // //                   className="cursor-pointer"
// // //                 >
// // //                    {letter}. {text}
// // //                 </span>
// // //               </button>
// // //             );
// // //           })}
// // //         </div>
// // //         {showExplanation && !isSelfExam && (
// // //           <>
// // //             <Explanation 
// // //               rationale={currentQuestion.rationale}
// // //               isVisible={showExplanation}
// // //               explanationImageUrl={currentQuestion.explanation_image_url}
// // //             />
// // //             <Feedback 
// // //               questionId={currentQuestion.id}
// // //               currentAnswer={currentQuestion.correct_choice}
// // //               options={options}
// // //               onSubmit={handleFeedbackSubmit}
// // //             />
// // //           </>
// // //         )}
// // //         <SubmitExam 
// // //           isOpen={isSubmitModalOpen}
// // //           onClose={() => setIsSubmitModalOpen(false)}
// // //           onSubmit={endQuiz}
// // //           unansweredQuestions={answers.filter(a => a === null).length}
// // //         />
// // //       </div>
// // //       <QuizFooter 
// // //         onPrevious={() => navigateQuestion(-1)}
// // //         onNext={() => navigateQuestion(1)}
// // //         onSubmit={handleSubmit}
// // //         currentQuestionIndex={currentQuestionIndex}
// // //         totalQuestions={questions.length}
// // //         onToggleBookmark={toggleBookmark}
// // //         isBookmarked={flaggedQuestions.includes(currentQuestionIndex)}
// // //       />
// // //     </div>
// // //   );
// // // };

// // // export default QuizComponent;

// // 'use client';

// // import React, { useState, useRef, useEffect, useCallback } from 'react';
// // import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// // import QuizHeader from './QuizHeader';
// // import Score from './Score';
// // import SubmitExam from './SubmitExam';
// // import Sidebar from './Sidebar';
// // import Explanation from './Explanation';
// // import Feedback from './Feedback';
// // import QuizFooter from './QuizFooter';

// // const QuizComponent = ({ questions, quizName, testTaker, isSelfExam = false }) => {
// //   const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
// //   const [score, setScore] = useState(0);
// //   const [quizEnded, setQuizEnded] = useState(false);
// //   const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
// //   const [answers, setAnswers] = useState(questions.map(q => q.userAnswer || null));
// //   const [flaggedQuestions, setFlaggedQuestions] = useState(questions.filter(q => q.isBookmarked).map((_, index) => index));
// //   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
// //   const [showExplanation, setShowExplanation] = useState(false);
// //   const [crossedOutChoices, setCrossedOutChoices] = useState({});
// //   const [feedbacks, setFeedbacks] = useState({});
// //   const timerRef = useRef(null);
// //   const supabase = createClientComponentClient();

// //   const navigateQuestion = useCallback((direction) => {
// //     const newIndex = currentQuestionIndex + direction;
// //     if (newIndex >= 0 && newIndex < questions.length) {
// //       setCurrentQuestionIndex(newIndex);
// //       setShowExplanation(false);
// //     }
// //   }, [currentQuestionIndex, questions.length]);

// //   useEffect(() => {
// //     const handleKeyDown = (event) => {
// //       if (event.key === 'ArrowLeft') {
// //         navigateQuestion(-1);
// //       } else if (event.key === 'ArrowRight') {
// //         navigateQuestion(1);
// //       }
// //     };

// //     window.addEventListener('keydown', handleKeyDown);
// //     return () => window.removeEventListener('keydown', handleKeyDown);
// //   }, [navigateQuestion]);

// //   const saveUserResponse = async (questionId, userAnswer, isBookmarked) => {
// //     if (isSelfExam) return; // Don't save responses for self-assessment

// //     const { data: { user } } = await supabase.auth.getUser();
// //     console.log('Saving user response:', { user_id: user.id, question_id: questionId, user_answer: userAnswer, is_bookmarked: isBookmarked });
// //     const { data, error } = await supabase
// //       .from('user_responses')
// //       .upsert({
// //         user_id: user.id,
// //         question_id: questionId,
// //         user_answer: userAnswer,
// //         is_bookmarked: isBookmarked
// //       }, { onConflict: ['user_id', 'question_id'] });
  
// //     if (error) {
// //       console.error('Error saving user response:', error);
// //       console.error('Error details:', JSON.stringify(error, null, 2));
// //     } else {
// //       console.log('User response saved successfully:', data);
// //     }
// //   };

// //   const updateChoiceVotes = async (questionId, choice) => {
// //     console.log('Starting updateChoiceVotes function');
// //     console.log('Inputs:', { questionId, choice });

// //     if (!questionId || typeof questionId !== 'string') {
// //       console.error('Invalid questionId:', questionId);
// //       return;
// //     }

// //     if (!choice || typeof choice !== 'string' || !['A', 'B', 'C', 'D', 'E', 'F'].includes(choice.toUpperCase())) {
// //       console.error('Invalid choice:', choice);
// //       return;
// //     }

// //     try {
// //       console.log('Calling Supabase RPC function');
// //       const { data, error } = await supabase.rpc('increment_choice_votes', {
// //         q_id: questionId,
// //         choice: choice.toUpperCase()
// //       });

// //       console.log('Supabase RPC response:', { data, error });

// //       if (error) {
// //         console.error('Supabase RPC error:', error);
// //         console.error('Error code:', error.code);
// //         console.error('Error message:', error.message);
// //         console.error('Error details:', error.details);
// //         throw error;
// //       }

// //       console.log('Choice votes updated successfully');
// //       return data;
// //     } catch (error) {
// //       console.error('Caught error in updateChoiceVotes:', error);
// //       if (error.response) {
// //         console.error('Error response:', error.response);
// //       }
// //       throw error;
// //     }
// //   };

// //   const handleAnswer = async (selectedOption) => {
// //     setAnswers(prevAnswers => {
// //       const newAnswers = [...prevAnswers];
// //       newAnswers[currentQuestionIndex] = selectedOption;
// //       return newAnswers;
// //     });
// //     if (!isSelfExam) {
// //       setShowExplanation(true);
// //       await saveUserResponse(
// //         questions[currentQuestionIndex].id, 
// //         selectedOption, 
// //         flaggedQuestions.includes(currentQuestionIndex)
// //       );
// //       await updateChoiceVotes(questions[currentQuestionIndex].id, selectedOption);
// //     }
// //   };

// //   const handleSubmit = () => {
// //     setIsSubmitModalOpen(true);
// //   };

// //   const endQuiz = useCallback(() => {
// //     const finalScore = answers.reduce((acc, answer, index) => {
// //       if (answer === questions[index].correct_choice) {
// //         return acc + 1;
// //       }
// //       return acc;
// //     }, 0);
// //     setScore(finalScore);
// //     setQuizEnded(true);
// //     setIsSubmitModalOpen(false);
// //   }, [answers, questions]);

// //   const toggleBookmark = async () => {
// //     const newFlaggedQuestions = flaggedQuestions.includes(currentQuestionIndex)
// //       ? flaggedQuestions.filter(q => q !== currentQuestionIndex)
// //       : [...flaggedQuestions, currentQuestionIndex];
    
// //     setFlaggedQuestions(newFlaggedQuestions);
    
// //     if (!isSelfExam) {
// //       await saveUserResponse(
// //         questions[currentQuestionIndex].id, 
// //         answers[currentQuestionIndex], 
// //         newFlaggedQuestions.includes(currentQuestionIndex)
// //       );
// //     }
// //   };

// //   const toggleCrossOut = (letter) => {
// //     setCrossedOutChoices(prev => ({
// //       ...prev,
// //       [currentQuestionIndex]: {
// //         ...prev[currentQuestionIndex],
// //         [letter]: !prev[currentQuestionIndex]?.[letter]
// //       }
// //     }));
// //   };

// //   const handleFeedbackSubmit = async (feedback) => {
// //     if (isSelfExam) return; // Don't submit feedback for self-assessment

// //     console.log("Feedback submitted:", feedback);

// //     const { data: { user } } = await supabase.auth.getUser();

// //     const { data, error } = await supabase
// //       .from('feedback')
// //       .insert({
// //         question_id: feedback.questionId,
// //         feedback_type: feedback.feedbackType,
// //         suggested_answer: feedback.suggestedAnswer || null,
// //         feedback_text: feedback.feedbackText,
// //         user_id: user.id
// //       });

// //     if (error) {
// //       console.error('Error submitting feedback:', error);
// //     } else {
// //       console.log('Feedback submitted successfully:', data);
// //       setFeedbacks(prev => ({
// //         ...prev,
// //         [feedback.questionId]: [
// //           ...(prev[feedback.questionId] || []),
// //           feedback
// //         ]
// //       }));
// //     }
// //   };

// //   useEffect(() => {
// //     if (currentQuestionIndex === questions.length - 1) {
// //       setIsSubmitModalOpen(true);
// //     }
// //   }, [currentQuestionIndex, questions.length]);

// //   if (quizEnded) {
// //     return <Score 
// //       score={score} 
// //       totalQuestions={questions.length} 
// //       quizName={quizName}
// //       time={timerRef.current?.getTime()} 
// //       answers={answers.map((answer, index) => ({
// //         question: questions[index].question_text,
// //         selectedAnswer: answer,
// //         correctAnswer: questions[index].correct_choice,
// //         isCorrect: answer === questions[index].correct_choice,
// //         rationale: questions[index].rationale,
// //         isBookmarked: flaggedQuestions.includes(index),
// //         subject: questions[index].subject || 'Unknown',
// //         feedback: feedbacks[questions[index].id]
// //       }))}
// //     />;
// //   }

// //   if (questions.length === 0) {
// //     return <div className="bg-white text-black p-8">Loading questions...</div>;
// //   }

// //   const currentQuestion = questions[currentQuestionIndex];

// //   if (!currentQuestion) {
// //     return <div className="bg-white text-black p-8">Error loading question. Please try again.</div>;
// //   }

// //   const options = ['A', 'B', 'C', 'D', 'E', 'F']
// //     .map(letter => ({ letter, text: currentQuestion[`option_${letter.toLowerCase()}`] }))
// //     .filter(option => option.text !== null);

// //   return (
// //     <div className="flex flex-col min-h-screen bg-white">
// //       <QuizHeader 
// //         testTaker={testTaker}
// //         quizName={quizName}
// //         timerRef={timerRef}
// //         currentQuestionIndex={currentQuestionIndex}
// //         totalQuestions={questions.length}
// //         onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
// //       />
// //       <Sidebar 
// //         questions={questions}
// //         currentQuestion={currentQuestionIndex}
// //         setCurrentQuestion={(index) => {
// //           setCurrentQuestionIndex(index);
// //           setShowExplanation(false);
// //         }}
// //         flaggedQuestions={flaggedQuestions}
// //         isOpen={isSidebarOpen}
// //         onClose={() => setIsSidebarOpen(false)}
// //       />
// //       <div className="flex-grow p-8 pb-20">
// //         <div className="mb-4">
// //           {currentQuestion.question_image_url && (
// //             <img src={currentQuestion.question_image_url} alt="Question" className="mt-4 max-w-full h-auto" />
// //           )}
// //           <p className="text-4xl text-black font-semibold">{currentQuestion.question_text}</p>
// //         </div>
// //         <div className="space-y-4">
// //           {options.map(({ letter, text }) => {
// //             const isSelected = answers[currentQuestionIndex] === letter;
// //             const isCorrect = letter === currentQuestion.correct_choice;
// //             const isCrossedOut = crossedOutChoices[currentQuestionIndex]?.[letter];
            
// //             let buttonClass = "block w-full text-left p-4 text-3xl border-2 transition-colors ";
            
// //             if (isSelected) {
// //               if (isSelfExam) {
// //                 buttonClass += "bg-blue-200 border-blue-500 "; // Show selection without indicating correctness
// //               } else {
// //                 buttonClass += isCorrect 
// //                   ? "bg-[#e6fff9] border-[#009875] text-[#009875]" 
// //                   : "bg-[#ffeded] border-[#DD0000] text-[#DD0000]";
// //               }
// //             } else {
// //               buttonClass += "bg-slate-100 border-black hover:bg-slate-200";
// //             }

// //             if (isCrossedOut) {
// //               buttonClass += " line-through";
// //             }

// //             return (
// //               <button
// //                 key={letter}
// //                 onClick={() => handleAnswer(letter)}
// //                 className={buttonClass}
// //               >
// //                 <span 
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     toggleCrossOut(letter);
// //                   }}
// //                   className="cursor-pointer"
// //                 >
// //                    {letter}. {text}
// //                 </span>
// //               </button>
// //             );
// //           })}
// //         </div>
// //         {showExplanation && !isSelfExam && (
// //           <>
// //             <Explanation 
// //               rationale={currentQuestion.rationale}
// //               isVisible={showExplanation}
// //               explanationImageUrl={currentQuestion.explanation_image_url}
// //             />
// //             <Feedback 
// //               questionId={currentQuestion.id}
// //               currentAnswer={currentQuestion.correct_choice}
// //               options={options}
// //               onSubmit={handleFeedbackSubmit}
// //             />
// //           </>
// //         )}
// //         <SubmitExam 
// //           isOpen={isSubmitModalOpen}
// //           onClose={() => setIsSubmitModalOpen(false)}
// //           onSubmit={endQuiz}
// //           unansweredQuestions={answers.filter(a => a === null).length}
// //         />
// //       </div>
// //       <QuizFooter 
// //         onPrevious={() => navigateQuestion(-1)}
// //         onNext={() => navigateQuestion(1)}
// //         onSubmit={handleSubmit}
// //         currentQuestionIndex={currentQuestionIndex}
// //         totalQuestions={questions.length}
// //         onToggleBookmark={toggleBookmark}
// //         isBookmarked={flaggedQuestions.includes(currentQuestionIndex)}
// //       />
// //     </div>
// //   );
// // };

// // export default QuizComponent;
'use client';

import React, { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';
import QuizHeader from './QuizHeader';
import Score from './Score';
import SubmitExam from './SubmitExam';
import Sidebar from './Sidebar';
import Explanation from './Explanation';
import Feedback from './Feedback';
import QuizFooter from './QuizFooter';

const QuizComponent = ({ questions, quizName, testTaker, isSelfExam = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [answers, setAnswers] = useState(questions.map(q => q.userAnswer || null));
  const [flaggedQuestions, setFlaggedQuestions] = useState(questions.filter(q => q.isBookmarked).map((_, index) => index));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [crossedOutChoices, setCrossedOutChoices] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const timerRef = useRef(null);
  const supabase = createClientComponentClient();

  const navigateQuestion = useCallback((direction) => {
    const newIndex = currentQuestionIndex + direction;
    if (newIndex >= 0 && newIndex < questions.length) {
      setCurrentQuestionIndex(newIndex);
      setShowExplanation(false);
    }
  }, [currentQuestionIndex, questions.length]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowLeft') {
        navigateQuestion(-1);
      } else if (event.key === 'ArrowRight') {
        navigateQuestion(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateQuestion]);

  const saveUserResponse = async (questionId, userAnswer, isBookmarked) => {
    if (isSelfExam) return; // Don't save responses for self-assessment

    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('user_responses')
      .upsert({
        user_id: user.id,
        question_id: questionId,
        user_answer: userAnswer,
        is_bookmarked: isBookmarked
      }, { onConflict: ['user_id', 'question_id'] });
  
    if (error) {
      console.error('Error saving user response:', error);
    } else {
      console.log('User response saved successfully:', data);
    }
  };

  const updateChoiceVotes = async (questionId, choice) => {
    try {
      const { data, error } = await supabase.rpc('increment_choice_votes', {
        q_id: questionId,
        choice: choice.toUpperCase()
      });

      if (error) {
        console.error('Supabase RPC error:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Caught error in updateChoiceVotes:', error);
      throw error;
    }
  };

  const handleAnswer = async (selectedOption) => {
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestionIndex] = selectedOption;
      return newAnswers;
    });
    if (!isSelfExam) {
      setShowExplanation(true);
      await saveUserResponse(
        questions[currentQuestionIndex].id, 
        selectedOption, 
        flaggedQuestions.includes(currentQuestionIndex)
      );
      await updateChoiceVotes(questions[currentQuestionIndex].id, selectedOption);
    }
  };

  const handleSubmit = () => {
    setIsSubmitModalOpen(true);
  };

  const endQuiz = useCallback(() => {
    const finalScore = answers.reduce((acc, answer, index) => {
      if (answer === questions[index].correct_choice) {
        return acc + 1;
      }
      return acc;
    }, 0);
    setScore(finalScore);
    setQuizEnded(true);
    setIsSubmitModalOpen(false);
  }, [answers, questions]);

  const toggleBookmark = async () => {
    const newFlaggedQuestions = flaggedQuestions.includes(currentQuestionIndex)
      ? flaggedQuestions.filter(q => q !== currentQuestionIndex)
      : [...flaggedQuestions, currentQuestionIndex];
    
    setFlaggedQuestions(newFlaggedQuestions);
    
    if (!isSelfExam) {
      await saveUserResponse(
        questions[currentQuestionIndex].id, 
        answers[currentQuestionIndex], 
        newFlaggedQuestions.includes(currentQuestionIndex)
      );
    }
  };

  const toggleCrossOut = (letter) => {
    setCrossedOutChoices(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        ...prev[currentQuestionIndex],
        [letter]: !prev[currentQuestionIndex]?.[letter]
      }
    }));
  };

  const handleFeedbackSubmit = async (feedback) => {
    if (isSelfExam) return; // Don't submit feedback for self-assessment

    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        question_id: feedback.questionId,
        feedback_type: feedback.feedbackType,
        suggested_answer: feedback.suggestedAnswer || null,
        feedback_text: feedback.feedbackText,
        user_id: user.id
      });

    if (error) {
      console.error('Error submitting feedback:', error);
    } else {
      console.log('Feedback submitted successfully:', data);
      setFeedbacks(prev => ({
        ...prev,
        [feedback.questionId]: [
          ...(prev[feedback.questionId] || []),
          feedback
        ]
      }));
    }
  };

  useEffect(() => {
    if (currentQuestionIndex === questions.length - 1) {
      setIsSubmitModalOpen(true);
    }
  }, [currentQuestionIndex, questions.length]);

  if (quizEnded) {
    return <Score 
      score={score} 
      totalQuestions={questions.length} 
      quizName={quizName}
      time={timerRef.current?.getTime()} 
      answers={answers.map((answer, index) => ({
        question: questions[index].question_text,
        selectedAnswer: answer,
        correctAnswer: questions[index].correct_choice,
        isCorrect: answer === questions[index].correct_choice,
        rationale: questions[index].rationale,
        isBookmarked: flaggedQuestions.includes(index),
        subject: questions[index].subject || 'Unknown',
        feedback: feedbacks[questions[index].id]
      }))}
    />;
  }

  if (questions.length === 0) {
    return <div className="bg-white text-black p-8">Loading questions...</div>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!currentQuestion) {
    return <div className="bg-white text-black p-8">Error loading question. Please try again.</div>;
  }

  const options = ['A', 'B', 'C', 'D', 'E', 'F']
    .map(letter => ({ letter, text: currentQuestion[`option_${letter.toLowerCase()}`] }))
    .filter(option => option.text !== null);

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="flex flex-col min-h-screen bg-white">
          <QuizHeader 
            testTaker={testTaker}
            quizName={quizName}
            timerRef={timerRef}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
          <Sidebar 
            questions={questions}
            currentQuestion={currentQuestionIndex}
            setCurrentQuestion={(index) => {
              setCurrentQuestionIndex(index);
              setShowExplanation(false);
            }}
            flaggedQuestions={flaggedQuestions}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
          <div className="flex-grow p-8 pb-20">
            <div className="mb-4">
              {currentQuestion.question_image_url && (
                <Image src={currentQuestion.question_image_url} alt="Question" className="mt-4 max-w-full h-auto" width={500} height={500} />
              )}
              <p className="text-4xl text-black font-semibold">{currentQuestion.question_text}</p>
            </div>
            <div className="space-y-4">
              {options.map(({ letter, text }) => {
                const isSelected = answers[currentQuestionIndex] === letter;
                const isCorrect = letter === currentQuestion.correct_choice;
                const isCrossedOut = crossedOutChoices[currentQuestionIndex]?.[letter];
                
                let buttonClass = "block w-full text-left p-4 text-3xl border-2 transition-colors ";
                
                if (isSelected) {
                  if (isSelfExam) {
                    buttonClass += "bg-blue-200 border-blue-500 "; // Show selection without indicating correctness
                  } else {
                    buttonClass += isCorrect 
                      ? "bg-[#e6fff9] border-[#009875] text-[#009875]" 
                      : "bg-[#ffeded] border-[#DD0000] text-[#DD0000]";
                  }
                } else {
                  buttonClass += "bg-slate-100 border-black hover:bg-slate-200";
                }

                if (isCrossedOut) {
                  buttonClass += " line-through";
                }

                return (
                  <button
                    key={letter}
                    onClick={() => handleAnswer(letter)}
                    className={buttonClass}
                  >
                    <span 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCrossOut(letter);
                      }}
                      className="cursor-pointer"
                    >
                      {letter}. {text}
                    </span>
                  </button>
                );
              })}
            </div>
            {showExplanation && !isSelfExam && (
              <>
                <Explanation 
                  rationale={currentQuestion.rationale}
                  isVisible={showExplanation}
                  explanationImageUrl={currentQuestion.explanation_image_url}
                />
                <Feedback 
                  questionId={currentQuestion.id}
                  currentAnswer={currentQuestion.correct_choice}
                  options={options}
                  onSubmit={handleFeedbackSubmit}
                />
              </>
            )}
            <SubmitExam 
              isOpen={isSubmitModalOpen}
              onClose={() => setIsSubmitModalOpen(false)}
              onSubmit={endQuiz}
              unansweredQuestions={answers.filter(a => a === null).length}
            />
          </div>
          <QuizFooter 
            onPrevious={() => navigateQuestion(-1)}
            onNext={() => navigateQuestion(1)}
            onSubmit={handleSubmit}
            currentQuestionIndex={currentQuestionIndex}
            totalQuestions={questions.length}
            onToggleBookmark={toggleBookmark}
            isBookmarked={flaggedQuestions.includes(currentQuestionIndex)}
          />
        </div>
      </Suspense>
    </>
  );
};

export default QuizComponent;
