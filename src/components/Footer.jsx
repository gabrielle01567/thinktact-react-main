import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2">
            <Link to="/" className="text-pink-950 font-bold text-lg">ThinkTactAI</Link>
            <p className="mt-1 text-sm text-gray-600">
              Bringing clarity to an era of intellectual noise through AI-powered argument analysis.
            </p>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Navigation</h3>
            <ul className="space-y-1">
              <li><Link to="/" className="text-sm text-gray-600 hover:text-pink-900">Home</Link></li>
              <li><Link to="/analyzer" className="text-sm text-gray-600 hover:text-pink-900">Analyzer</Link></li>
              <li><Link to="/about" className="text-sm text-gray-600 hover:text-pink-900">About</Link></li>
              <li><Link to="/research" className="text-sm text-gray-600 hover:text-pink-900">Research</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-gray-700 uppercase mb-2">Connect</h3>
            <p className="text-sm text-gray-600 mb-2">admin@thinktact.ai</p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-500 hover:text-pink-900">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-pink-900">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            &copy; {currentYear} ThinkTactAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 