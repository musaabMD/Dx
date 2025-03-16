'use client';

import { useState } from 'react';
import config from "@/config";
import ButtonCheckout from "./ButtonCheckout";

// <Pricing/> displays the pricing plans for your app
// It's your Stripe config in config.js.stripe.plans[] that will be used to display the plans
// <ButtonCheckout /> renders a button that will redirect the user to Stripe checkout called the /api/stripe/create-checkout API endpoint with the correct priceId

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-indigo-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Invest in Your Success
          </p>
        </div>
        
        <div className="mt-16 flex justify-center">
          <div className="relative rounded-2xl bg-white shadow-lg ring-1 ring-gray-900/10 sm:mx-auto sm:max-w-lg">
            <div className="p-8">
              <h3 className="text-center text-2xl font-semibold leading-8 text-gray-900">Premium Access</h3>
              <p className="mt-4 text-center text-lg text-gray-600">Everything you need to pass your exam</p>
              
              <div className="mt-6 flex items-center justify-center gap-x-4">
                <h4 className="flex-none text-sm font-semibold leading-6 text-indigo-600">What&apos;s included</h4>
                <div className="h-px flex-auto bg-gray-100"></div>
              </div>
              
              <ul role="list" className="mt-8 grid grid-cols-1 gap-4 text-sm leading-6 text-gray-600">
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Full access to all question banks
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Detailed explanations for each answer
                </li>
                <li className="flex gap-x-3">
                  <svg className="h-6 w-5 flex-none text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                  Performance tracking & analytics
                </li>
              </ul>
              
              <div className="mt-8 flex justify-center">
                <a
                  href="/signup"
                  className="rounded-md bg-indigo-600 px-8 py-4 text-center text-xl font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Start Free Trial
                </a>
              </div>
              <p className="mt-4 text-center text-sm text-gray-500">
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
      <p>Don&apos;t miss out on this offer!</p>
    </div>
  );
};

export default Pricing;
