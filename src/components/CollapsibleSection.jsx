import React, { useState, useEffect } from 'react';

// Avatar component for chat display
const Avatar = ({ type }) => (
  <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${
    type === 'A' ? 'bg-pink-950 text-white' : 'bg-gray-300 text-gray-700'
  }`}>
    {type}
  </div>
);

// Message component for chat display
const Message = ({ type, content }) => (
  <div className="flex items-start mb-4">
    <Avatar type={type} />
    <div className={`ml-3 text-sm p-3 rounded-lg max-w-[85%] ${type === 'A' ? 'bg-pink-50 text-gray-900' : 'bg-gray-100 text-gray-900'}`}>
      <p>{content}</p>
    </div>
  </div>
);

const CollapsibleSection = ({ title, children, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Automatically open sections when loading finishes and there's content
  useEffect(() => {
    if (!isLoading && children && typeof children === 'string' && children !== 'Not found' && children?.length > 0) {
      // setIsOpen(true); // Optionally auto-open populated sections
    }
    if (!isLoading && Array.isArray(children) && children?.length > 0) {
      // setIsOpen(true); // Optionally auto-open populated sections
    }
    // Add more conditions if children structure varies (e.g., objects for premises)
  }, [isLoading, children]);

  // Determine if content exists to display
  const hasContent = () => {
    if (!children || children === 'Not found') return false;
    if (typeof children === 'string' && children.trim() === '') return false;
    if (Array.isArray(children) && children?.length === 0) return false;
    // Add checks for object types if necessary (e.g., premiseSets)
    if (typeof children === 'object' && !Array.isArray(children) && children !== null) {
      if (title === 'Premise Sets' && children.explicit?.length === 0 && children.implicit?.length === 0) return false;
      if (title === 'Conclusion' && !children.text) return false;
      if (title === 'Counterpoint' && !children.personB) return false;
    }
    return true;
  };

  // Render nothing if loading is finished and there's no content
  if (!isLoading && !hasContent()) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
      <button
        className="w-full px-5 py-3 text-left font-medium text-gray-700 hover:bg-gray-50 flex justify-between items-center focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        // Disable button if loading
        disabled={isLoading}
      >
        <span>{title}</span>
        {isLoading ? (
          <span className="text-xs text-gray-500">Loading...</span>
        ) : (
          <svg
            className={`w-5 h-5 transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        )}
      </button>
      {isOpen && !isLoading && hasContent() && (
        <div className="px-5 py-4 bg-white border-t border-gray-200">
          {/* Render content based on type */}
          {Array.isArray(children) ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
              {children.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
          ) : typeof children === 'object' && !Array.isArray(children) && title === 'Premise Sets' ? (
            <div className="space-y-3 text-sm text-gray-700">
              {children.explicit?.length > 0 && (
                <div>
                  <strong className="font-medium text-gray-800">Explicit:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {children.explicit.map((item, index) => <li key={`exp-${index}`}>{item}</li>)}
                  </ul>
                </div>
              )}
              {children.implicit?.length > 0 && (
                <div>
                  <strong className="font-medium text-gray-800">Implicit:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1">
                    {children.implicit.map((item, index) => <li key={`imp-${index}`}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : typeof children === 'object' && !Array.isArray(children) && title === 'Conclusion' ? (
              <p className="text-gray-700 text-sm">
                {children.text}
                {children.type && children.type !== 'Not found' && <span className="text-xs text-gray-500 ml-2">({children.type})</span>}
              </p>
          ) : typeof children === 'object' && !Array.isArray(children) && title === 'Counterpoint' ? (
              <div className="space-y-4">
                <Message type="A" content={children.personA || "Original argument not provided."} />
                <Message type="B" content={children.personB || "Counterpoint not generated."} />
              </div>
          ) : (
            <p className="text-gray-700 text-sm">{children}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection; 