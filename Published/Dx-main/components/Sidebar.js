// 'use client';

// import { useEffect, useRef } from 'react';
// import { Suspense } from 'react';
// export default function Sidebar({ questions, currentQuestion, setCurrentQuestion, flaggedQuestions, isOpen, onClose }) {
//   const sidebarRef = useRef();

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
//         onClose();
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [onClose]);

//   return (
    
//     <>
//     <Suspense>
   
//     <div
//       ref={sidebarRef}
//       id="sidebar-mini"
//       className={`hs-overlay transition-all duration-300 transform fixed top-16 bottom-0 left-0 z-[60] w-20 bg-white border-e border-gray-200 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
//     >
//       <div className="flex flex-col py-4">
//         {questions.map((question, index) => (
//           <div
//             key={index}
//             className={`p-2 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} ${index === currentQuestion ? 'bg-gray-300 border-2 border-gray-600' : 'text-gray-800 hover:bg-gray-300'}`}
//             onClick={() => setCurrentQuestion(index)}
//           >
//             {index + 1}
//             {flaggedQuestions.includes(index) && (
//               <span className="ml-2 text-red-500">★</span>
//             )}
//           </div>
//         ))}
//       </div>
//     </div>
         
//     </Suspense>
//     </>
//   );
// }

'use client';

import { useEffect, useRef } from 'react';
import { Suspense } from 'react';

export default function Sidebar({ questions, currentQuestion, setCurrentQuestion, flaggedQuestions = [], isOpen, onClose }) {
  const sidebarRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  return (
    <>
      <Suspense>
        <div
          ref={sidebarRef}
          id="sidebar-mini"
          className={`hs-overlay transition-all duration-300 transform fixed top-16 bottom-0 left-0 z-[60] w-20 bg-white border-e border-gray-200 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="flex flex-col py-4">
            {questions.map((question, index) => (
              <div
                key={index}
                className={`p-2 cursor-pointer ${index % 2 === 0 ? 'bg-white' : 'bg-gray-100'} ${index === currentQuestion ? 'bg-gray-300 border-2 border-gray-600' : 'text-gray-800 hover:bg-gray-300'}`}
                onClick={() => setCurrentQuestion(index)}
              >
                {index + 1}
                {Array.isArray(flaggedQuestions) && flaggedQuestions.includes(index) && (
                  <span className="ml-2 text-red-500">★</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Suspense>
    </>
  );
}
