// // components/SubjectList.js
// import React from 'react';
// import Link from 'next/link';
// import { Suspense } from 'react';
// const SubjectList = ({ subjects }) => {
//   return (
//     <>
//     <Suspense>


   
//     <div className="subject-list">
//       {subjects.map(subject => (
//         <div key={subject.subject} className="subject-item">
//           <Link href={`/subjects/${encodeURIComponent(subject.subject)}`}>
//             <a>
//               <h2>{subject.subject} ({subject.count} Questions)</h2>
//             </a>
//           </Link>
//         </div>
//       ))}
//     </div>
//     </Suspense>
    
//     </>
//   );
// };

// export default SubjectList;
