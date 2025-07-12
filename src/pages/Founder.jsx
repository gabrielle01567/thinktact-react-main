import { Link } from 'react-router-dom';

const Founder = () => {
  return (
    <div className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold tracking-tight text-pink-950 sm:text-4xl">Meet the Founder</h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The story behind ThinkTactAI and its mission.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="mx-auto max-w-md">
              {/* Placeholder for founder image - replace with actual image */}
            </div>
            
            <div>
              <p className="text-gray-600 mb-4 font-medium text-center">A message from our founder and CEO</p>
              <div className="space-y-4 text-gray-600 text-center">
                <p>
                  After years working in both tech and academia, I founded ThinkTactAI with a vision to bridge the gap 
                  between powerful artificial intelligence and human critical thinking.
                </p>
                <p>
                  My background in philosophy and cognitive science taught me that one of the most valuable skills 
                  we can develop is the ability to analyze arguments effectively. In today's complex information 
                  environment, this skill is more important than ever.
                </p>
                <p>
                  ThinkTactAI emerged from the recognition that AI could help people navigate the increasingly complex and 
                  often manipulative information landscape we all face daily. By creating tools that break down arguments 
                  into their logical components, we can help people see past rhetoric to the underlying reasoning.
                </p>
                <p>
                  My vision is to create a world where critical thinking is accessible to everyone, where arguments are 
                  evaluated on their merits rather than their emotional appeal, and where we can engage in productive 
                  dialogue across differences.
                </p>
              </div>
              
              <div className="mt-8 flex space-x-6">
                <a href="#" className="text-gray-500 hover:text-pink-900">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-500 hover:text-pink-900">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="mt-16 space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-pink-950 mb-3">Intellectual Clarity</h3>
                <p className="text-gray-600">
                  We believe in stripping away rhetoric to reveal the logical structure of arguments, 
                  helping people understand the true nature of what's being communicated.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-pink-950 mb-3">Critical Empowerment</h3>
                <p className="text-gray-600">
                  Our goal is to empower people with the tools and skills they need to navigate 
                  the complex information landscape with confidence and discernment.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-bold text-pink-950 mb-3">Thoughtful Dialogue</h3>
                <p className="text-gray-600">
                  We value productive discourse that acknowledges different perspectives and seeks 
                  to understand rather than simply win arguments.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <Link
              to="/analyzer"
              className="rounded-md bg-pink-950 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-pink-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-950"
            >
              Try the Analyzer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Founder; 