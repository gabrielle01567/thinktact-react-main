import React from 'react';
import { Link } from 'react-router-dom';

const Research = () => {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">Research & Publications</h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Explore our research on logical infrastructure, argument analysis, and the future of structured reasoning.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:mt-10 lg:max-w-none lg:grid-cols-2">
          <article className="flex max-w-xl flex-col items-start justify-between">
            <div className="flex items-center gap-x-4 text-xs">
              <time dateTime="2024-04" className="text-gray-500">April 2024</time>
              <span className="relative z-10 rounded-full bg-pink-50 px-3 py-1.5 font-medium text-pink-900">Manifesto</span>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                <Link to="/research/clarity-infrastructure">
                  <span className="absolute inset-0" />
                  Clarity as Infrastructure: The ThinkTact Manifesto for a Logical Web
                </Link>
              </h3>
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                A foundational document outlining our vision for rebuilding the logic layer of the web, addressing the epistemic breakdown in digital discourse.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Research; 