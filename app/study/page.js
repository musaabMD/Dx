'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import UpgradeModal from '@/components/UpgradeModal';

export default function StudyPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  
  // Use window.supabase if available, otherwise create a new client
  // This ensures we're reusing the existing client if it exists
  const getSupabase = () => {
    if (typeof window !== 'undefined' && window.supabase) {
      return window.supabase;
    }
    
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    if (typeof window !== 'undefined') {
      window.supabase = client;
    }
    
    return client;
  };

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const supabase = getSupabase();
        
        // First try to load user data
        let userData;
        
        try {
          // This approach avoids creating a new session
          const existingSession = await supabase.auth.getSession();
          userData = existingSession?.data?.session?.user;
        } catch (authError) {
          console.log('Auth error, redirecting to login:', authError);
          // There's an auth error, redirect to login
          router.push('/signin');
          return;
        }
        
        if (!userData) {
          console.log('No user data available, redirecting to login');
          router.push('/signin');
          return;
        }
        
        // Set user data
        setUser(userData);
        
        // Fetch exams from user_data table
        const { data: userExamData, error: examError } = await supabase
          .from('user_data')
          .select('examname, subscription_status, remaining_days, disable, trial')
          .eq('user_id', userData.id);

        if (examError) {
          console.error('Error fetching user exams:', examError);
          setExams([]);
        } else if (userExamData && userExamData.length > 0) {
          // Filter active exams
          const activeExams = userExamData
            .filter(data => 
              (data.subscription_status === 'active' && data.remaining_days > 0 && !data.disable) || data.trial
            )
            .map(data => ({
              exam_id: data.examname,
              exam_name: data.examname
            }));
          
          setExams(activeExams);
        } else {
          setExams([]);
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, [router]);

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
  };

  const fetchQuestionsForExam = async (examId) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('qs')
        .select('*')
        .eq('examname', examId)
        .order('id', { ascending: true })
        .limit(200);
      
      if (error) {
        console.error('Error fetching questions:', error);
        return [];
      }

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
      const examQuestions = await fetchQuestionsForExam(selectedExam.exam_id);
      setQuestions(examQuestions);
      setExamStarted(true);
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Simple QuizComponent directly in this file
  const QuizComponent = ({ questions, quizName, testTaker }) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState(new Array(questions.length).fill(null));
    const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Array(questions.length).fill(false));
    const [remainingTime, setRemainingTime] = useState(3 * 60 * 60); // 3 hours in seconds
    const [examSubmitted, setExamSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
      // Set up timer
      const timer = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, []);

    const handleAnswerSelect = (answer) => {
      const updatedAnswers = [...userAnswers];
      updatedAnswers[currentQuestionIndex] = answer;
      setUserAnswers(updatedAnswers);
    };

    const handleBookmarkToggle = () => {
      const updatedBookmarks = [...bookmarkedQuestions];
      updatedBookmarks[currentQuestionIndex] = !updatedBookmarks[currentQuestionIndex];
      setBookmarkedQuestions(updatedBookmarks);
    };

    const handleNext = () => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    };

    const handlePrev = () => {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      }
    };

    const jumpToQuestion = (index) => {
      setCurrentQuestionIndex(index);
    };

    const handleSubmit = () => {
      // Calculate results
      const correctAnswers = questions.filter(
        (question, index) => userAnswers[index] === question.correct_answer
      ).length;
      
      const score = Math.round((correctAnswers / questions.length) * 100);
      
      setResults({
        examName: quizName,
        testTaker,
        score,
        correctCount: correctAnswers,
        totalQuestions: questions.length,
        timeTaken: (3 * 60 * 60) - remainingTime,
      });
      
      setExamSubmitted(true);
    };

    const formatTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (examSubmitted && results) {
      return (
        <div className="container mx-auto p-4">
          <div className="bg-white shadow-md rounded p-6">
            <h1 className="text-2xl font-bold mb-4">{quizName} - Results</h1>
            
            <div className="mb-6">
              <p className="text-lg">
                Score: <span className="font-bold">{results.score}%</span>
              </p>
              <p>
                You got {results.correctCount} out of {results.totalQuestions} questions correct.
              </p>
              <p>Time taken: {formatTime(results.timeTaken)}</p>
            </div>
            
            <button
              onClick={() => router.push('/study')}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Return to Study Materials
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const answeredCount = userAnswers.filter(answer => answer !== null).length;
    const progress = (answeredCount / questions.length) * 100;

    return (
      <div className="container mx-auto p-4">
        {/* Header with timer and progress */}
        <div className="flex justify-between items-center mb-4 bg-slate-100 p-3 rounded-md">
          <div>
            <h1 className="text-xl font-bold">{quizName}</h1>
            <p>Question {currentQuestionIndex + 1} of {questions.length}</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{formatTime(remainingTime)}</p>
            <p>Remaining Time</p>
          </div>
          <div>
            <p>Progress: {Math.round(progress)}%</p>
            <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question and answer area */}
        <div className="bg-white shadow-md rounded p-6 mb-4">
          <div className="flex justify-between mb-4">
            <span>Question {currentQuestionIndex + 1}</span>
            <button
              onClick={handleBookmarkToggle}
              className={`${
                bookmarkedQuestions[currentQuestionIndex]
                  ? 'text-yellow-500'
                  : 'text-gray-400'
              }`}
            >
              {bookmarkedQuestions[currentQuestionIndex] ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          </div>

          <h2 className="text-xl mb-6">{currentQuestion.question}</h2>

          <div className="space-y-3">
            {['A', 'B', 'C', 'D', 'E'].map((option) => {
              if (currentQuestion[`option_${option.toLowerCase()}`]) {
                return (
                  <div
                    key={option}
                    className={`p-3 border rounded cursor-pointer ${
                      userAnswers[currentQuestionIndex] === option
                        ? 'bg-blue-100 border-blue-500'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleAnswerSelect(option)}
                  >
                    <label className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        name="answer"
                        value={option}
                        checked={userAnswers[currentQuestionIndex] === option}
                        onChange={() => handleAnswerSelect(option)}
                        className="mr-2 mt-1"
                      />
                      <div>
                        <span className="font-bold">{option}:</span>{' '}
                        {currentQuestion[`option_${option.toLowerCase()}`]}
                      </div>
                    </label>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {/* Navigation controls */}
        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className={`bg-gray-500 text-white py-2 px-4 rounded ${
              currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'
            }`}
          >
            Previous
          </button>

          <button
            onClick={handleSubmit}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2"
          >
            Submit Exam
          </button>

          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
            className={`bg-blue-500 text-white py-2 px-4 rounded ${
              currentQuestionIndex === questions.length - 1
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-600'
            }`}
          >
            Next
          </button>
        </div>

        {/* Question navigation */}
        <div className="mt-6">
          <h3 className="mb-2 font-bold">Question Navigator:</h3>
          <div className="grid grid-cols-10 gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => jumpToQuestion(index)}
                className={`w-10 h-10 flex items-center justify-center rounded ${
                  index === currentQuestionIndex
                    ? 'bg-blue-500 text-white'
                    : bookmarkedQuestions[index]
                    ? 'bg-yellow-100 border border-yellow-500'
                    : userAnswers[index] !== null
                    ? 'bg-green-100 border border-green-500'
                    : 'bg-gray-100 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (examStarted) {
    return (
      <QuizComponent 
        questions={questions} 
        quizName={selectedExam.exam_name}
        testTaker={user ? user.user_metadata?.full_name || "Test Taker" : "Test Taker"}
      />
    );
  }

  // Check if user has any exams
  const hasExams = exams.length > 0;

  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen">Loading...</div>}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Study Materials</h1>
          <button 
            onClick={() => router.push('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
          >
            Back to Home
          </button>
        </div>
        
        {!hasExams ? (
          <div className="bg-slate-100 p-6 rounded-lg text-center">
            <p className="mb-4 font-sans text-xl">You don't have access to any study materials</p>
            
            <button 
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              Upgrade to Access Study Materials
            </button>
            <UpgradeModal isOpen={isModalOpen} onClose={closeModal} />
          </div>
        ) : !selectedExam ? (
          <>
            <p className="mb-4">Select study material to begin:</p>
            <p className="mb-4 font-sans font-bold text-2xl">Your Available Materials:</p>

            <ul className="space-y-2">
              {exams.map((exam, index) => (
                <li 
                  key={index} 
                  className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover-border-black cursor-pointer"
                  onClick={() => handleExamSelect(exam)}
                >
                  {exam.exam_name}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="bg-white shadow-md rounded p-6">
            <h2 className="text-2xl font-semibold mb-4">Study Instructions for {selectedExam.exam_name}</h2>
            <p className="mb-4">This study session will help you prepare for your exam. You will have 3 hours to complete the practice questions.</p>
            <p className="mb-4">Instructions:</p>
            <ul className="list-disc list-inside mb-4">
              <li>Answer the questions at your own pace.</li>
              <li>You can bookmark difficult questions to review later.</li>
              <li>Your results will be available immediately after completion.</li>
              <li>This is a practice session to help you identify areas that need more study.</li>
              <li>Your answers will be saved for future reference.</li>
            </ul>
            
            <div className="flex space-x-4 mt-6">
              <button 
                onClick={() => setSelectedExam(null)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back
              </button>
              <button 
                onClick={handleStartExam}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Studying
              </button>
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
}