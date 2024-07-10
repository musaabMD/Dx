'use client'; // Add this line to specify it's a client component

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { Suspense } from 'react';
export default function ExamsPage() {
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('qtable')
        .select('examname')
        .order('examname', { ascending: true });

      if (error) {
        console.error('Error fetching exams:', error);
      } else {
        setExams(data);
      }
    }

    fetchData();
  }, []);

  return (
    <>
    <Suspense>


 
    <div>
      <h1>Exams</h1>
      <ul>
        {exams.map((exam) => (
          <li key={exam.examname}>
            <Link href={`/exams/${exam.examname}`}>{exam.examname}</Link>
          </li>
        ))}
      </ul>
    </div>
    </Suspense>
    </>
  );
}
