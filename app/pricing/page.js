'use client';

import React from 'react';
import Header from '@/components/Header'; // Include this if you want to keep the header
import { Suspense } from 'react';
import Header from '@/components/Header';

const PricingPage = () => {
  return (
    <>
    <Suspense> 
   <Header/>
    <div className="min-h-screen flex flex-col">
      {/* Uncomment the Header component if you want to include the header */}
      {/* <Header /> */}
      <iframe 
        src="https://app.payhere.co/drnote" 
        className="flex-grow" 
        style={{ width: '100%', height: '100vh', border: 'none' }} 
        title="External Store"
      ></iframe>
    </div>
    </Suspense>
    </>
  );
};

export default PricingPage;
