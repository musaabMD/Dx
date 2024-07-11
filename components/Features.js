'use client';
import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Suspense } from 'react';
const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
  </svg>
);

const Features = () => {
  const [features, setFeatures] = useState([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchFeatures = async () => {
      const { data, error } = await supabase.from('features').select('*');
      if (error) {
        console.error('Error fetching features:', error);
      } else {
        setFeatures(data);
      }
    };

    fetchFeatures();
  }, [supabase]);

  return (

    <>
    <Suspense>


  
    <div className="relative bg-white py-24 sm:py-32 lg:py-40">
      <div className="mx-auto max-w-md px-6 text-center sm:max-w-3xl lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-semibold text-indigo-600">DrNote Features</h2>
        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Everything you need to score high in your exam
        </p>
        <p className="mx-auto mt-5 max-w-prose text-2xl text-gray-500">
         
        </p>
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.id} className="pt-6">
                <div className="flow-root rounded-lg bg-gray-50 px-6 pb-8 border-2 border-slate-300 font-sans">
                  <div className="-mt-6">
                    <div>
                      <span className="inline-flex items-center justify-center rounded-xl bg-green-500 p-3 shadow-lg ">
                        <StarIcon />
                      </span>
                    </div>
                    <h3 className="mt-8 text-3xl font-semibold leading-8 tracking-tight text-gray-900 ">
                      {feature.name}
                    </h3>
                    <p className="mt-5 text-2xl leading-7 text-gray-600 ">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </Suspense>
    </>
  );
};

export default Features;
