'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import Header from '@/components/Header';
import UpgradeModal from '@/components/UpgradeModal';
import { Suspense } from 'react';

export default function StudyPage() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [examStarted, setExamStarted] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  
  // Create Supabase client with your environment variables
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
    const fetchUserAndExams = async () => {
      try {
        // Try to get the user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('Error getting user:', userError);
          setLoading(false);
          return;
        }
        
        if (!user) {
          console.log('No user found, redirecting to signin');
          router.push('/signin');
          return;
        }

        setUser(user);

        // Now fetch exams from user_data table
        const { data: examsData, error: examsError } = await supabase
          .from('user_data')
          .select('examname, subscription_status, remaining_days, disable, trial')
          .eq('user_id', user.id);

        if (examsError) {
          console.error('Error fetching exams:', examsError);
        } else {
          // Filter for active exams (same logic as your ProtectedQuizLink)
          const activeExams = examsData
            .filter(data => 
              (data.subscription_status === 'active' && data.remaining_days > 0 && !data.disable) || data.trial
            )
            .map(item => item.examname);
            
          const uniqueExams = [...new Set(activeExams)];
          setExams(uniqueExams);
        }
      } catch (error) {
        console.error('Error fetching user or exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndExams();
  }, [supabase, router]);

  const handleExamSelect = (exam) => {
    setSelectedExam(exam);
  };

  const fetchQuestionsForExam = async (examName) => {
    try {
      const { data, error } = await supabase
        .from('qs')
        .select('*')
        .eq('examname', examName)
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
    return <div>Loading...</div>;
  }

  if (examStarted) {
    // Since we're not importing the QuizComponent, we'll redirect to the quiz page
    router.push(`/quiz/${selectedExam.replace(/ /g, '-')}`);
    return <div>Loading quiz...</div>;
  }

  return (
    <Suspense>
      <div>
        <Header />
        <UpgradeModal isOpen={isModalOpen} onClose={closeModal} />
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4">Study Materials</h1>
          
          {!selectedExam ? (
            <>
              <p className="mb-4">Select a study material to begin:</p>
              <p className="mb-4 font-sans font-bold text-2xl">Available Materials</p>

              {exams.length === 0 ? (
                <div className="bg-slate-100 p-6 rounded-lg text-center">
                  <p className="mb-4 font-sans text-xl">You don&apos;t have access to any study materials</p>
                  <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Upgrade to Access Study Materials
                  </button>
                </div>
              ) : (
                <ul className="space-y-2">
                  {exams.map((exam, index) => (
                    <li 
                      key={index} 
                      className="bg-slate-100 border-2 border-slate-500 text-2xl shadow rounded p-3 pt-7 pb-7 hover:bg-slate-200 hover:border-3 hover-border-black cursor-pointer"
                      onClick={() => handleExamSelect(exam)}
                    >
                      {exam}
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold mb-4">Study Instructions for {selectedExam}</h2>
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
            </>
          )}
        </div>
      </div>
    </Suspense>
  );
}