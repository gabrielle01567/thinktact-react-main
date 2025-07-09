import React, { useState } from 'react';

const StatCard = ({ title, value, icon, color, textColor, assumptions }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Special handling for Hidden Assumptions
  const isHiddenAssumptions = title === "Hidden Assumptions";
  const displayValue = isHiddenAssumptions && assumptions && assumptions.length > 0 
    ? assumptions[0] // Show first assumption as main text
    : value;

  return (
    <div className={`${color} h-full rounded-lg shadow-md border-l-4 border-l-${textColor.replace('text-', 'border-')} border-t-0 border-r-0 border-b-0 transition-all hover:shadow-lg relative`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</h3>
          <div className="text-2xl">{icon}</div>
        </div>
        <p 
          className={`text-xl font-bold ${textColor} line-clamp-2 truncate cursor-help`}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {displayValue}
        </p>
        {isHiddenAssumptions && assumptions && assumptions.length > 1 && (
          <p className="text-sm text-gray-500 mt-1">
            +{assumptions.length - 1} more
          </p>
        )}
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className={`absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 ${color} border border-gray-200 text-sm rounded-lg shadow-lg ${(title === 'Conclusion Type' || title === 'Logical Flaw' || title === 'Counter Argument') ? 'max-w-xl' : 'max-w-md'} whitespace-normal`}>
          <div className={`font-semibold mb-1 ${textColor}`}>{title}</div>
          {isHiddenAssumptions && assumptions && assumptions.length > 0 ? (
            <div className="text-gray-700 leading-relaxed">
              {assumptions.map((assumption, index) => (
                <div key={index} className="mb-2">
                  <span className="font-medium">{index + 1}.</span> {assumption}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-700 leading-relaxed">{value}</div>
          )}
          {/* Tooltip arrow */}
          <div className={`absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent ${color.replace('bg-', 'border-t-')}`}></div>
        </div>
      )}
    </div>
  );
};

export default StatCard; 