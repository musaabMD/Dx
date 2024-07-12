'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Header from '@/components/Header';
import UpgradeModal from '@/components/UpgradeModal';
import Wall from '@/components/Wall';
import QuizComponent from '@/components/QuizComponent';
import blueprints from '@/app/blueprints';
import { Suspense } from 'react';
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

        const { data, error } = await supabase
          .from('qtable')
          .select('examname')
          .order('examname');

        if (error) {
          console.error('Error fetching exams:', error);
        } else {
          const uniqueExams = [...new Set(data.map(item => item.examname))];
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
    const { data, error } = await supabase
      .from('qtable')
      .select('*')
      .eq('examname', examName);

    if (error) {
      console.error('Error fetching questions:', error);
      return [];
    }

    const blueprint = blueprints[examName] || {};
    const questionsBySubject = data.reduce((acc, question) => {
      if (!acc[question.subject]) {
        acc[question.subject] = [];
      }
      acc[question.subject].push(question);
      return acc;
    }, {});

    const selectedQuestions = Object.entries(blueprint).flatMap(([subject, weight]) => {
      const subjectQuestions = questionsBySubject[subject] || [];
      const numQuestions = Math.floor((weight / 100) * 200);
      return subjectQuestions.slice(0, numQuestions);
    }).slice(0, 200).map(question => ({
      ...question,
      userAnswer: null,
      isBookmarked: false,
    }));

    return selectedQuestions;
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
    return (
      <Wall examName={selectedExam}>
        <QuizComponent 
          questions={questions} 
          quizName={selectedExam}
          testTaker={user ? user.user_metadata?.full_name || "Test Taker" : "Test Taker"}
          isSelfExam={true}
        />
      </Wall>
    );
  }

  return (

    <Suspense>
    <div>


     
      <Header />
      <UpgradeModal isOpen={isModalOpen} onClose={closeModal} />
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Self Assessment</h1>
        
        {!selectedExam ? (
          <>
            <p className="mb-4">Select an exam to start your self-assessment:</p>
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
          </>
        ) : (
          <Wall examName={selectedExam}>
            <>
              <h2 className="text-2xl font-semibold mb-4">Exam Instructions for {selectedExam}</h2>
              <p className="mb-4">This is a self-assessment exam. You will have 3 hours to complete it once you start.</p>
              <p className="mb-4">Instructions:</p>
              <ul className="list-disc list-inside mb-4">
                <li>You cannot pause the exam once started.</li>
                <li>Answer all questions to the best of your ability.</li>
                <li>You can review and change your answers within the time limit.</li>
                <li>Your results will be available immediately after completion.</li>
                <li>This is a fresh assessment - no previous answers or bookmarks will be shown.</li>
              </ul>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Blueprint:</h3>
                <ul className="list-disc list-inside">
                  {Object.entries(blueprints[selectedExam] || {}).map(([subject, weight]) => (
                    <li key={subject}>{subject}: {weight}%</li>
                  ))}
                </ul>
              </div>
              <button 
                onClick={handleStartExam}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Start Exam
              </button>
            </>
          </Wall>
        )}
      </div>
    </div>
    </Suspense>
  );
}
