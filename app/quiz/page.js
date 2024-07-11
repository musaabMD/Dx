// "use client";
// import { fetchExamsData } from './serverComponent';
// import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
// import { cookies } from "next/headers";
// import Link from "next/link";
// import Header from "@/components/Header";

// export default async function ExamsListPage() {
//   // Use fetchExamsData to get the exams data
//   const { examsData, connectionError, examsError } = await fetchExamsData();

//   if (connectionError) {
//     console.error('Error connecting to Supabase:', connectionError);
//     return <div>Error connecting to the database. Please try again later.</div>;
//   }

//   if (examsError) {
//     console.error('Error fetching exams:', examsError);
//     return <div>Error loading exams. Please try again later.</div>;
//   }

//   return (
//     <>
//       <Header />
//       <div className="container mx-auto p-4">
//         <br />
//         <h1 className="text-4xl font-bold mb-4">Available Exams</h1>
//         <br />
//         <br />
//         <ul className="space-y-2">
//           {examsData.map((exam, index) => (
//             <li key={index} className="bg-slate-100 border-3 shadow rounded p-5 border-2 border-slate-500 hover:bg-slate-200" >
//               <Link href={`/exams/${encodeURIComponent(exam.examname)}`}>
//                 <span className="text-blue-600 text-3xl font-sans font-semibold">{exam.examname}</span>
//               </Link>
//               <p className="mt-2">
//                 {exam.fileCount} Files, {exam.questionCount} Questions
//               </p>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </>
//   );
// }
// ExamsListPage.js

import { fetchExamsData } from './serverComponent';
import ExamsListClient from './ExamsListClient';
import { Suspense } from 'react';

export default async function ExamsListPage() {
    const { examsData, connectionError, examsError } = await fetchExamsData();

    if (connectionError) {
        console.error('Error connecting to Supabase:', connectionError);
        return <div>Error connecting to the database. Please try again later.</div>;
    }

    if (examsError) {
        console.error('Error fetching exams:', examsError);
        return <div>Error loading exams. Please try again later.</div>;
    }

    return 
    
    <Suspense>

   
    <ExamsListClient examsData={examsData} />
    </Suspense>
    
    ;
}
