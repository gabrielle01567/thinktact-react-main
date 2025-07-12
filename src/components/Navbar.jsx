import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-pink-950 text-white' : 'text-gray-600 hover:text-pink-900 hover:bg-gray-50';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
              <div className="flex flex-col items-center">
                <svg 
                  className="h-9 w-9 text-pink-950" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  {/* Brain circuit design */}
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                  <path d="M12 6v12" />
                  <path d="M6 12h12" />
                  <path d="M8.5 8.5l7 7" />
                  <path d="M15.5 8.5l-7 7" />
                  {/* AI circuit nodes */}
                  <circle cx="12" cy="12" r="2" fill="currentColor" />
                  <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
                  <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
                  <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
                  <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
                </svg>
                {isAuthenticated && user?.isAdmin && (
                  <span className="text-xs text-pink-950 font-medium mt-1">Admin</span>
                )}
              </div>
              <span className="font-semibold text-lg text-pink-950">ThinkTactAI</span>
            </Link>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-1">
            <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/')}`}>
              Home
            </Link>

            {isAuthenticated && (user?.isAdmin || user?.isSuperUser || user?.email === 'alex.hawke54@gmail.com' || user?.email === 'admin@thinktact.ai') && (
              <Link to="/admin" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/admin')}`}>
                Admin
              </Link>
            )}
            <Link to="/analyzer" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/analyzer')}`}>
              Analyzer
            </Link>
            <Link to="/patent-buddy" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/patent-buddy')}`}>
              Patent Buddy
            </Link>
            <Link to="/about" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/about')}`}>
              About
            </Link>
            
            
            <Link to="/founder" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${isActive('/founder')}`}>
              Founder
            </Link>
            
            {/* Authentication buttons */}
            <div className="ml-4 flex items-center space-x-2">
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  {/* User dropdown menu */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-pink-950 hover:bg-gray-50 rounded-md transition-colors duration-150"
                    >
                      <div className="h-6 w-6 rounded-full bg-pink-950 flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {user?.firstName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <span className="hidden lg:block">{user?.firstName || user?.name || 'User'}</span>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>
                        <Link
                          to="/patent-applications"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Applications
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="px-4 py-2 rounded-md text-sm font-medium bg-pink-950 text-white hover:bg-pink-900 transition-colors duration-150"
                >
                  Sign in
                </Link>
              )}
            </div>
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
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}>
                Dashboard
              </Link>
              <Link to="/patent-applications" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/patent-applications')}`}>
                My Applications
              </Link>
            </>
          )}
          {isAuthenticated && (user?.isAdmin || user?.isSuperUser || user?.email === 'alex.hawke54@gmail.com' || user?.email === 'admin@thinktact.ai') && (
            <Link to="/admin" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/admin')}`}>
              Admin
            </Link>
          )}
          <Link to="/analyzer" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/analyzer')}`}>
            Analyzer
          </Link>
                      <Link to="/patent-buddy" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/patent-buddy')}`}>
              Patent Buddy
            </Link>
          <Link to="/about" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/about')}`}>
            About
          </Link>
          
          
          <Link to="/founder" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/founder')}`}>
            Founder
          </Link>
          
          {/* Mobile authentication */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to="/profile" className="flex items-center px-3 py-2 hover:bg-gray-50 rounded-md">
                  <div className="h-8 w-8 rounded-full bg-pink-950 flex items-center justify-center mr-3">
                    <span className="text-sm font-medium text-white">
                      {user?.firstName?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">{user?.firstName || user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="block px-3 py-2 rounded-md text-base font-medium bg-pink-950 text-white hover:bg-pink-900"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 