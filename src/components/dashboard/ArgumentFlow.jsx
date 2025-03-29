import React from 'react';

const ArgumentFlow = ({ structure }) => {
  // Extract premises into an array
  const premises = Array.isArray(structure.premise) 
    ? structure.premise 
    : [structure.premise];
  
  // Extract unstated assumptions if available
  const unstatedAssumptions = structure.unstatedAssumptions || [];
  
  return (
    <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Argument Structure</h3>
      </div>
      
      <div className="flex-1 flex flex-col items-center">
        {/* Conclusion - Top of pyramid */}
        <div className="w-full sm:w-5/6 md:w-3/4 lg:w-2/3 mb-5">
          <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 text-center shadow-sm">
            <div className="text-sm text-pink-600 font-semibold mb-1">CONCLUSION</div>
            <p className="text-gray-800 break-words">{structure.conclusion}</p>
          </div>
        </div>
        
        {/* Arrow connecting conclusion and premises */}
        <div className="h-14 w-0.5 bg-gray-300 relative mb-1">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Unstated assumptions - If present */}
        {unstatedAssumptions.length > 0 && (
          <div className="w-full mb-3">
            <div className="text-center mb-1 text-sm text-gray-500 font-medium">HIDDEN ASSUMPTIONS</div>
            <div className="grid grid-cols-1 gap-2">
              {unstatedAssumptions.map((assumption, index) => (
                <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm italic text-gray-700 flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-700">{index+1}</span>
                  </div>
                  <span className="break-words">{assumption}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Premises - Bottom of pyramid */}
        <div className="w-full">
          <div className="text-center mb-1 text-sm text-gray-500 font-medium">PREMISES</div>
          <div className="grid grid-cols-1 gap-2">
            {premises.map((premise, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-900 flex items-start">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5">
                  <span className="text-xs font-semibold text-green-700">{index+1}</span>
                </div>
                <span className="break-words">{premise}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgumentFlow; 