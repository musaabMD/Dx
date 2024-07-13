'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useParams } from 'next/navigation';
import QuizComponent from '@/components/QuizComponent';
import Header from '@/components/Header';
import Wall from '@/components/Wall';
import blueprints from '../../blueprints';
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
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          if (userError) throw userError;
          setTestTaker(user.user_metadata?.full_name || "Test Taker");
  
          const { data: questionsData, error: questionsError } = await supabase
            .from('qtable')
            .select('*')
            .eq('examname', examName)
            .order('id', { ascending: true });
          if (questionsError) throw questionsError;
  
          const { data: userResponsesData, error: userResponsesError } = await supabase
            .from('user_responses')
            .select('*')
            .eq('user_id', user.id);
          if (userResponsesError) throw userResponsesError;
  
          const blueprint = blueprints[examName];
          const questionsBySubject = questionsData.reduce((acc, question) => {
            if (!acc[question.subject]) {
              acc[question.subject] = [];
            }
            acc[question.subject].push(question);
            return acc;
          }, {});
  
          const combinedQuestions = Object.entries(blueprint).flatMap(([subject, weight]) => {
            const subjectQuestions = questionsBySubject[subject] || [];
            const numQuestions = Math.floor((weight / 100) * 200);
            return subjectQuestions.slice(0, numQuestions);
          }).map(question => {
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
        <Suspense>
     
      <Wall examName={examName}>
        <div>
          <Header />
          <QuizComponent 
            questions={questions}
            quizName={examName}
            testTaker={testTaker}
            isSelfExam={true}
          />
        </div>
      </Wall>
      </Suspense>
    );
  };
  
  export default SelfAssessmentExam;