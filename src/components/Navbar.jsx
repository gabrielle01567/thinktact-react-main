import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-pink-950 text-white' : 'text-gray-600 hover:text-pink-900 hover:bg-gray-50';
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
              <svg 
                className="h-9 w-9 text-pink-950" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M9.5 2a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                <path d="M14.5 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                <path d="M19.5 7a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                <path d="M19.5 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                <path d="M14.5 17a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                <path d="M9.5 19a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                <path d="M4.5 17a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                <path d="M4.5 10a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
                <path d="M8 4.5H16" />
                <path d="M8 19.5H16" />
                <path d="M3 8.8C2.28 9.2 2 9.7 2 10c0 .3.28.8 1 1.2" />
                <path d="M3 15.2c-.72.4-1 .9-1 1.2s.28.8 1 1.2" />
                <path d="M21 15.2c.72.4 1 .9 1 1.2s-.28.8-1 1.2" />
                <path d="M21 8.8c.72.4 1 .9 1 1.2s-.28.8-1 1.2" />
              </svg>
              <span className="font-semibold text-lg text-pink-950">ThinkTactAI</span>
            </Link>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/')}`}>
              Home
            </Link>
            <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/dashboard')}`}>
              Dashboard
            </Link>
            <Link to="/analyzer" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/analyzer')}`}>
              Analyzer
            </Link>
            <Link to="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/about')}`}>
              About
            </Link>
            <Link to="/blog" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/blog')}`}>
              Blog
            </Link>
            <Link to="/founder" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/founder')}`}>
              Founder
            </Link>
          </div>
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-pink-950 hover:text-white hover:bg-pink-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>
            Home
          </Link>
          <Link to="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}>
            Dashboard
          </Link>
          <Link to="/analyzer" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/analyzer')}`}>
            Analyzer
          </Link>
          <Link to="/about" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about')}`}>
            About
          </Link>
          <Link to="/blog" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/blog')}`}>
            Blog
          </Link>
          <Link to="/founder" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/founder')}`}>
            Founder
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 