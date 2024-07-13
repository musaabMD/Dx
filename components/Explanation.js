// 'use client';

// import React from 'react';

// const Explanation = ({ rationale, isVisible }) => {
//   if (!isVisible) return null;

//   return (
//     <>
   
//     <br />

 

//     <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      
//       <h3 className="font-bold text-3xl mb-10">Explanation</h3>
//       <p className="font-sans text-3xl mb-2">{rationale}</p>
//     </div>
//     </>
//   );
// };

// export default Explanation;
'use client';

import React from 'react';
import { Suspense } from 'react';

const Explanation = ({ rationale, isVisible, explanationImageUrl }) => {
  if (!isVisible) return null;

  return (
    <>
    <Suspense> 
      <br />
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-bold text-1xl mb-10">Explanation</h3>
        <p className="font-sans text-1xl mb-2">{rationale}</p>
        {explanationImageUrl && (
          <img src={explanationImageUrl} alt="Explanation" className="mt-4 max-w-full h-auto" />
        )}
      </div>
      </Suspense>
    </>
  );
};

export default Explanation;
