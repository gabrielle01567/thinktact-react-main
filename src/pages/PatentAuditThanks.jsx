import React from 'react';
import { Link } from 'react-router-dom';

const PatentAuditThanks = () => {
  return (
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            We got your draft
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Expect your red flag report in 48 hours. You're already smarter than most.
          </p>
          <div className="mt-10">
            <Link
              to="/"
              className="rounded-md bg-pink-950 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatentAuditThanks; 