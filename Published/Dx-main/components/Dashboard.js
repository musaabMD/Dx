'use client';

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Suspense } from 'react';
const Dashboard = () => {
  const [data, setData] = useState({
    totalExams: 0,
    questions: [],
    subjects: [],
    feedback: []
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const examsResponse = await supabase.rpc('get_total_exams');
        const questionsResponse = await supabase.from('exam_question_counts').select('*');
        const subjectsResponse = await supabase.from('exam_subject_counts').select('*');
        const feedbackResponse = await supabase.from('exam_feedback_counts').select('*');

        setData({
          totalExams: examsResponse.data?.[0]?.total_exams || 0,
          questions: questionsResponse.data || [],
          subjects: subjectsResponse.data || [],
          feedback: feedbackResponse.data || [],
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    <Suspense>

  
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Total Exams</h2>
          <p className="text-3xl">{data.totalExams}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Questions per Exam</h2>
          {data.questions.map((exam, index) => (
            <div key={index} className="mb-2">
              <p className="font-semibold">{exam.examname}: {exam.total_questions}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Subjects per Exam</h2>
          {data.subjects.map((subject, index) => (
            <div key={index} className="mb-2">
              <p className="font-semibold">{subject.examname} - {subject.subject}: {subject.total_questions_per_subject}</p>
            </div>
          ))}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Feedback per Exam</h2>
          {data.feedback.map((feedback, index) => (
            <div key={index} className="mb-2">
              <p className="font-semibold">{feedback.examname}: {feedback.total_feedback}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
      </Suspense>
    
    </>
  );
};

export default Dashboard;