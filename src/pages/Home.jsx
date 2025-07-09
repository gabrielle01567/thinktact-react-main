import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-pink-500 to-pink-300 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
        
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:flex lg:items-center lg:gap-x-10">
          <div className="max-w-2xl lg:max-w-xl lg:flex-shrink-0">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              ThinkTact<span className="text-pink-950">AI</span>
            </h1>
            <p className="mt-4 text-xl font-medium text-gray-600">
              The only tool that catches patent issues before the USPTO does.
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              ThinkTact shows you exactly why your patent might get rejected—before you spend time and money filing it.
            </p>
            <h2 className="mt-8 text-3xl font-bold text-gray-900 sm:text-4xl text-center">
              Let's spot the problems before the government does.
            </h2>
            <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <Link to="/patent-buddy" 
                className="flex items-center justify-center rounded-md bg-pink-950 px-5 py-3 text-base font-semibold text-white shadow-md hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950 transition-colors">
                Get My Patent Audit
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <a href="#demo" 
                className="flex items-center justify-center rounded-md bg-white px-5 py-3 text-base font-semibold text-pink-950 shadow-sm border border-pink-200 hover:bg-pink-50 transition-colors">
                Watch Demo
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                </svg>
              </a>
            </div>
          </div>
          <div className="mt-16 lg:mt-0 lg:flex-1">
            <div className="relative aspect-[3/2] overflow-hidden rounded-xl shadow-2xl">
              {/* Dashboard demo instead of static image */}
              <div className="h-full w-full bg-gray-50">
                <div className="bg-gray-100 p-4 rounded-t-lg border-b border-gray-200 flex items-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="mx-auto text-sm text-gray-500 font-medium">ThinkTactAI Dashboard</div>
                </div>
                <div className="p-4">
                  {/* Top row - Stat cards */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-blue-50 rounded p-2 text-xs">
                      <div className="font-semibold text-blue-800">Conclusion Type</div>
                      <div className="text-blue-700">Causal Claim</div>
                    </div>
                    <div className="bg-amber-50 rounded p-2 text-xs">
                      <div className="font-semibold text-amber-800">Logical Flaw</div>
                      <div className="text-amber-700">Correlation ≠ causation</div>
                    </div>
                  </div>
                  
                  {/* Middle Section */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {/* Argument box */}
                    <div className="bg-white rounded shadow-sm p-2 text-xs">
                      <div className="mb-1 font-medium text-gray-700">Your Argument</div>
                      <div className="bg-gray-50 p-1 rounded mb-1 text-gray-600">
                        Countries with gun control have less crime.
                      </div>
                      <div className="bg-green-50 p-1 rounded text-green-700 border border-green-200">
                        Evidence shows countries with regulations tend to have lower rates.
                      </div>
                    </div>
                    
                    {/* Argument flow */}
                    <div className="bg-white rounded shadow-sm p-2 text-xs">
                      <div className="mb-1 font-medium text-gray-700">Argument Structure</div>
                      <div className="bg-pink-50 p-1 rounded-lg mb-2 text-center text-pink-700 text-xs">
                        <span className="text-[10px] opacity-75">CONCLUSION</span><br/>
                        <span>Implementing laws will reduce crime</span>
                      </div>
                      <div className="h-2 w-0.5 bg-gray-300 mx-auto"></div>
                      <div className="grid gap-1 mt-1">
                        <div className="bg-green-50 p-1 rounded-lg text-green-700 text-xs flex items-start">
                          <span className="flex-shrink-0 w-3 h-3 rounded-full bg-green-200 flex items-center justify-center mr-1 mt-0.5 text-[9px] text-green-700 font-bold">1</span>
                          <span>Lower crime rates with gun control</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Table preview */}
                  <div className="bg-white rounded shadow-sm p-2 text-xs">
                    <div className="mb-1 font-medium text-gray-700">Logical Components</div>
                    <div className="grid grid-cols-3 gap-1">
                      <div className="p-1 bg-gray-100 text-[10px] font-medium text-gray-700">Component</div>
                      <div className="p-1 bg-gray-100 text-[10px] font-medium text-gray-700">Description</div>
                      <div className="p-1 bg-gray-100 text-[10px] font-medium text-gray-700">Importance</div>
                      
                      <div className="p-1 text-[10px]">Flaw</div>
                      <div className="p-1 text-[10px]">Correlation mistaken for causation</div>
                      <div className="p-1 text-[10px]"><span className="px-1 rounded-full bg-red-100 text-red-700 text-[8px]">High</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature section */}
      <div className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-pink-900">Analyze Faster</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Understand argument logic like never before</p>
            <p className="mt-6 text-lg leading-8 text-gray-600">ThinkTactAI helps you break down complex arguments into their logical components, identifying strengths, weaknesses, and hidden assumptions.</p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-950">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                  </div>
                  Immediate Insights
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Get instant analysis of your argument's logical structure, showing premises, conclusions, and the relationships between them.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-950">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  Identify Weaknesses
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Discover logical fallacies and weak points in arguments so you can strengthen your own reasoning or respond effectively to others.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-950">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                    </svg>
                  </div>
                  Uncover Assumptions
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Reveal hidden premises and unstated rules that underpin arguments, providing deeper insight into the reasoning process.</dd>
              </div>
              <div className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-pink-950">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  Powered by AI
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">Leveraging state-of-the-art AI to provide nuanced analysis of complex arguments across various domains and contexts.</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
      
      {/* CTA Banner */}
      <div className="bg-pink-950">
        <div className="mx-auto max-w-7xl py-12 px-6 lg:flex lg:items-center lg:py-16 lg:px-8">
          <div className="lg:w-0 lg:flex-1">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl" id="newsletter-headline">
              Start analyzing arguments now
            </h2>
            <p className="mt-3 max-w-3xl text-lg leading-6 text-pink-100">
              Enter your argument and get a comprehensive breakdown in seconds.
            </p>
          </div>
          <div className="mt-8 lg:ml-8 lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/patent-buddy" className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-pink-950 hover:bg-gray-50">
                Try the Analyzer
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 