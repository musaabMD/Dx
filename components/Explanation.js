'use client';

import React, { Suspense } from 'react';

const Explanation = ({ rationale, isVisible, explanationImageUrl }) => {
  if (!isVisible) return null;

  const splitRationale = rationale ? rationale.split('<br>The incorrect answers are: <br>') : ['No explanation available.'];
  const hasIncorrectAnswers = splitRationale.length > 1;

  return (
    <>
      <Suspense>
        <br />
        <div className="mt-4 p-6 bg-gray-100 rounded-lg shadow-lg">
          <h3 className="font-bold text-2xl mb-4">Explanation</h3>
          <div className="font-sans text-xl mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: splitRationale[0] }} />
          {hasIncorrectAnswers && (
            <>
              <h4 className="font-bold text-xl mb-2">The incorrect answers are:</h4>
              <div className="font-sans text-xl mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: splitRationale[1] }} />
            </>
          )}
          {explanationImageUrl && (
            <img src={explanationImageUrl} alt="Explanation" className="mt-4 max-w-full h-auto rounded-md" />
          )}
        </div>
      </Suspense>
    </>
  );
};

export default Explanation;
