// 'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import QuizHeader from './QuizHeader';
import Score from './Score';
import SubmitExam from './SubmitExam';
import Sidebar from './Sidebar';
import Explanation from './Explanation';
import Feedback from './Feedback';
import QuizFooter from './QuizFooter';
import Image from 'next/image';

const QuizComponent = ({ questions, examName, testTaker, isSelfExam = false }) => {
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
  // Add new state for show answers mode
  const [showAnswersMode, setShowAnswersMode] = useState(false);

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
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        throw sessionError;
      }
      if (!session) {
        console.log('User not authenticated');
        throw new Error('User not authenticated');
      }

      const response = await fetch('/api/quiz/save-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question_id: questionId,
          user_answer: userAnswer,
          is_bookmarked: isBookmarked,
          a_clicked: false,
          b_clicked: false,
          c_clicked: false,
          d_clicked: false,
          e_clicked: false,
          f_clicked: false
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error response from server:', result);
        throw new Error(result.error || 'Failed to save response');
      }

      console.log('Response saved successfully:', result);
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const updateChoiceVotes = async (questionId, choice) => {
    try {
      const validChoices = ['A', 'B', 'C', 'D', 'E', 'F'];
      if (!validChoices.includes(choice.toUpperCase())) {
        throw new Error('Invalid choice');
      }

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
    if (!showAnswersMode) {
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
    } else {
      setAnswers(prevAnswers => {
        const newAnswers = [...prevAnswers];
        newAnswers[currentQuestionIndex] = selectedOption;
        return newAnswers;
      });
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
      try {
        await saveUserResponse(
          questions[currentQuestionIndex].id, 
          answers[currentQuestionIndex], 
          newFlaggedQuestions.includes(currentQuestionIndex)
        );
      } catch (error) {
        console.error('Error toggling bookmark:', error);
      }
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
  
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('Error getting user:', userError);
      return;
    }
  
    const { data, error } = await supabase
      .from('feedback')
      .insert({
        question_id: feedback.questionId,
        feedback_type: feedback.feedbackType,
        suggested_answer: feedback.suggested_answer || null, // Corrected column name
        feedback_text: feedback.feedbackText,
        user_id: user.id,
        exam_name: feedback.examName, // Ensure examName is passed correctly
        status: 'In Progress' // Set a default status
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

  useEffect(() => {
    const preventCopyPaste = (e) => {
      e.preventDefault();
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);

    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
    };
  }, []);

  if (quizEnded) {
    return <Score 
      score={score} 
      totalQuestions={questions.length} 
      quizName={examName} // Changed to examName
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
    <div className="flex flex-col min-h-screen bg-white">
      <QuizHeader
        testTaker={testTaker}
        quizName={examName}
        timerRef={timerRef}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        showAnswersMode={showAnswersMode}
        setShowAnswersMode={setShowAnswersMode}
        isSelfExam={isSelfExam}
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
          <p className="text-xl text-black font-semibold mb-2">{`${examName} - ${currentQuestion.subject || 'Unknown'}`}</p> {/* Display exam name and subject */}
          {currentQuestion.question_image_url && (
            <Image src={currentQuestion.question_image_url} alt="Question" className="mt-4 max-w-full h-auto" width={500} height={500} />
          )}
          <p className="text-2xl text-black font-semibold">{currentQuestion.question_text}</p>
        </div>
        <div className="space-y-4">
          {options.map(({ letter, text }) => {
            const isCorrect = letter === currentQuestion.correct_choice;
            const isCrossedOut = crossedOutChoices[currentQuestionIndex]?.[letter];
            
            let buttonClass = "block w-full text-left p-4 text-2xl border-2 transition-colors ";
            
            // Show correct/incorrect styling immediately if showAnswersMode is true
            if (showAnswersMode) {
              buttonClass += isCorrect 
                ? "bg-[#e6fff9] border-[#009875] text-[#009875]" 
                : "bg-slate-100 border-black hover:bg-slate-200";
            } else {
              // Original styling logic for when answers are hidden
              const isSelected = answers[currentQuestionIndex] === letter;
              if (isSelected) {
                buttonClass += isCorrect 
                  ? "bg-[#e6fff9] border-[#009875] text-[#009875]" 
                  : "bg-[#ffeded] border-[#DD0000] text-[#DD0000]";
              } else {
                buttonClass += "bg-slate-100 border-black hover:bg-slate-200";
              }
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
                  {showAnswersMode && isCorrect && (
                    <span className="ml-2 text-[#009875]"> ✓ (Correct Answer)</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Show explanation immediately if showAnswersMode is true */}
        {(showAnswersMode || showExplanation) && (
          <>
            <Explanation 
              rationale={currentQuestion.rationale}
              isVisible={true}
              explanationImageUrl={currentQuestion.explanation_image_url}
            />
            {!showAnswersMode && (
              <Feedback 
                questionId={currentQuestion.id}
                examName={examName}
                currentAnswer={currentQuestion.correct_choice}
                options={options}
                onSubmit={handleFeedbackSubmit}
              />
            )}
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
  );
};

export default QuizComponent;
