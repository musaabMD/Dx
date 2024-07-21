// "use client";

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { Suspense } from "react";

// const ExamHome = () => {
//   const [exams, setExams] = useState([]);
//   const [error, setError] = useState(null);
//   const supabase = createClientComponentClient();

//   const colors = [
//     "bg-teal-300",
//     "bg-yellow-300",
//     "bg-orange-400",
//     "bg-violet-400",
//     "bg-indigo-400",
//     "bg-blue-200",
//     "bg-cyan-400",
//     "bg-rose-700",
//     "bg-stone-500"
//   ];

//   useEffect(() => {
//     const fetchExams = async () => {
//       console.log("Fetching exams...");
//       try {
//         const { data, error } = await supabase.rpc("get_exams_with_question_count");
//         if (error) {
//           console.error("Error fetching exams:", error);
//           setError(error.message);
//         } else {
//           console.log("Exams fetched successfully:", data);
//           setExams(data);
//         }
//       } catch (err) {
//         console.error("Unexpected error during fetch:", err);
//         setError(err.message);
//       }
//     };
//     fetchExams();
//   }, [supabase]);

//   const handleExamClick = async (exam) => {
//     console.log("Handling exam click for:", exam.name);
//     try {
//       const { error } = await supabase
//         .from("exams")
//         .update({ clicks: exam.clicks + 1 })
//         .eq("id", exam.id);
//       if (error) {
//         console.error("Error updating click count:", error);
//       } else {
//         console.log("Click count updated successfully");
//       }
//     } catch (err) {
//       console.error("Unexpected error during click update:", err);
//     }
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (exams.length === 0) {
//     return <div>Loading exams...</div>;
//   }

//   return (
//     <>
//       <Suspense>
//         <div className="py-8 bg-zinc-900">
//           <br />
//           <h2 className="text-3xl font-bold mb-4 text-center text-white">Available Exams</h2>
//           <h4 className="text-2xl font-light font-sans mb-4 text-center text-white">
//             بنك أسئلة لاختبارات الهيئة السعودية للتخصصات الصحية
//           </h4>
//           <br />
//           <br />
//           <div className="flex justify-center">
//             <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded">
//               {exams.map((exam, index) => (
//                 <Link key={exam.id} href={`/exams/${encodeURIComponent(exam.initials)}`} legacyBehavior>
//                   <a onClick={() => handleExamClick(exam)}>
//                     <div
//                       className={`p-6 rounded-lg shadow-lg text-black cursor-pointer w-full flex flex-col justify-center items-center ${colors[index % colors.length]} border-2 border-slate-800`}
//                     >
//                       <h3 className="text-2xl font-bold">{exam.initials}</h3>
//                       <h3 className="text-2xl font-normal">{exam.name}</h3>
//                     </div>
//                   </a>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </Suspense>
//     </>
//   );
// };

// export default ExamHome;

// 'use client';

// import React, { useEffect, useState } from "react";
// import Link from "next/link";
// import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
// import { Suspense } from "react";

// const ExamHome = () => {
//   const [exams, setExams] = useState([]);
//   const [error, setError] = useState(null);
//   const supabase = createClientComponentClient();

//   const colors = [
//     "bg-teal-300",
//     "bg-yellow-300",
//     "bg-orange-400",
//     "bg-violet-400",
//     "bg-indigo-400",
//     "bg-blue-200",
//     "bg-cyan-400",
//     "bg-rose-700",
//     "bg-stone-500"
//   ];

//   useEffect(() => {
//     const fetchExams = async () => {
//       console.log("Fetching exams...");
//       try {
//         const { data, error } = await supabase.rpc("get_exams_with_question_count");
//         if (error) {
//           console.error("Error fetching exams:", error);
//           setError(error.message);
//         } else {
//           console.log("Exams fetched successfully:", data);
//           setExams(data);
//         }
//       } catch (err) {
//         console.error("Unexpected error during fetch:", err);
//         setError(err.message);
//       }
//     };
//     fetchExams();
//   }, [supabase]);

//   const handleExamClick = async (exam) => {
//     console.log("Handling exam click for:", exam.name);
//     try {
//       const { error } = await supabase
//         .from("exams")
//         .update({ clicks: exam.clicks + 1 })
//         .eq("id", exam.id);
//       if (error) {
//         console.error("Error updating click count:", error);
//       } else {
//         console.log("Click count updated successfully");
//       }
//     } catch (err) {
//       console.error("Unexpected error during click update:", err);
//     }
//   };

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   if (exams.length === 0) {
//     return <div>Loading exams...</div>;
//   }

//   return (
//     <>
//       <Suspense>
//         <div className="py-8 bg-zinc-900">
//           <br />
//           <h2 className="text-3xl font-bold mb-4 text-center text-white">Available Exams</h2>
//           <h4 className="text-2xl font-light font-sans mb-4 text-center text-white">
//             بنك أسئلة لاختبارات الهيئة السعودية للتخصصات الصحية
//           </h4>
//           <br />
//           <br />
//           <div className="flex justify-center">
//             <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded">
//               {exams.map((exam, index) => (
//                 <Link key={exam.id} href={`/exams/${encodeURIComponent(exam.initials)}`} legacyBehavior>
//                   <a onClick={() => handleExamClick(exam)}>
//                     <div
//                       className={`p-6 rounded-lg shadow-lg text-black cursor-pointer w-full flex flex-col justify-center items-center ${colors[index % colors.length]} border-2 border-slate-800`}
//                     >
//                       <h3 className="text-2xl font-bold">{exam.initials}</h3>
//                       <h3 className="text-2xl font-normal">{exam.name}</h3>
//                       <p className="mt-2">{exam.question_count} Questions</p>
//                     </div>
//                   </a>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//       </Suspense>
//     </>
//   );
// };

'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Suspense } from "react";

const ExamHome = () => {
  const [exams, setExams] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [error, setError] = useState(null);
  const supabase = createClientComponentClient();

  const colors = [
    "bg-teal-300",
    "bg-yellow-300",
    "bg-orange-400",
    "bg-violet-400",
    "bg-indigo-400",
    "bg-blue-200",
    "bg-cyan-400",
    "bg-rose-700",
    "bg-stone-500"
  ];

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const { data: examsData, error: examsError } = await supabase
          .from('exams')
          .select('id, name, initials, clicks');
        
        if (examsError) {
          console.error("Error fetching exams:", examsError);
          setError(examsError.message);
          return;
        }
        setExams(examsData);
        
        const { data: summariesData, error: summariesError } = await supabase
          .from('exam_summary')
          .select('exam_id, total_questions');
        
        if (summariesError) {
          console.error("Error fetching summaries:", summariesError);
          setError(summariesError.message);
          return;
        }
        setSummaries(summariesData);

      } catch (err) {
        console.error("Unexpected error during fetch:", err);
        setError(err.message);
      }
    };

    fetchExams();
  }, [supabase]);

  const examsWithSummaries = exams.map(exam => {
    const summary = summaries.find(summary => summary.exam_id === exam.id);
    return { ...exam, total_questions: summary?.total_questions || 0 };
  });

  const handleExamClick = async (exam) => {
    console.log("Handling exam click for exam ID:", exam.id);
    try {
      const { error } = await supabase
        .from('exams')
        .update({ clicks: exam.clicks + 1 })
        .eq('id', exam.id);
      
      if (error) {
        console.error('Error updating click count:', error);
      } else {
        console.log('Click count updated successfully');
      }
    } catch (err) {
      console.error('Unexpected error during click update:', err);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (examsWithSummaries.length === 0) {
    return <div>Loading exams...</div>;
  }

  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="py-8 bg-zinc-900">
          <br />
          <h2 className="text-3xl font-bold mb-4 text-center text-white">Available Exams</h2>
          <h4 className="text-2xl font-light font-sans mb-4 text-center text-white">
            بنك أسئلة لاختبارات الهيئة السعودية للتخصصات الصحية
          </h4>
          <br />
          <br />
          <div className="flex justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 rounded">
              {examsWithSummaries.map((exam, index) => (
                <Link 
                  key={exam.id} 
                  href={`/exams/${encodeURIComponent(exam.initials)}`} 
                  legacyBehavior
                >
                  <a onClick={() => handleExamClick(exam)}>
                    <div
                      className={`p-6 rounded-lg shadow-lg text-black cursor-pointer w-full flex flex-col justify-center items-center ${colors[index % colors.length]} border-2 border-slate-800`}
                    >
                      <h3 className="text-2xl font-bold">{exam.initials}</h3>
                      <h3 className="text-1xl font-light">{exam.name}</h3>
                      <p className="mt-2 font-semibold ">{exam.total_questions} Questions</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Suspense>
    </>
  );
};

export default ExamHome;
