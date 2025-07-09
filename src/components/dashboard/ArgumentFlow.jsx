import React from 'react';
import SafeTextFormatter from '../SafeTextFormatter';

const ArgumentFlow = ({ structure = {} }) => {
  // Extract premises into an array
  let premises = Array.isArray(structure?.premise) 
    ? structure.premise 
    : [structure?.premise || "No clear premise"];
  
  // Handle case where premises might be a single long string that needs splitting
  if (premises.length === 1 && typeof premises[0] === 'string' && premises[0].length > 500) {
    console.log('Long premise detected, attempting to split:', premises[0].substring(0, 100) + '...');
    // Try to split by common separators
    const splitPremises = premises[0].split(/(?:\d+\.\s*|\n\s*\d+\.\s*|\n\s*•\s*|\n\s*-\s*)/).filter(p => p.trim());
    if (splitPremises.length > 1) {
      premises = splitPremises.map(p => p.trim()).filter(p => p.length > 0);
      console.log('Split into', premises.length, 'premises');
    }
  }
  
  // Extract unstated assumptions if available
  const unstatedAssumptions = structure?.unstatedAssumptions || [];
  
  // Debug logging
  console.log('ArgumentFlow Debug:', {
    structure,
    premises,
    premisesLength: premises.length,
    firstPremise: premises[0]?.substring(0, 200) + (premises[0]?.length > 200 ? '...' : ''),
    premiseType: typeof premises[0],
    firstPremiseLength: premises[0]?.length || 0,
    allPremisesLength: premises.reduce((total, p) => total + (p?.length || 0), 0)
  });
  
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
            <SafeTextFormatter 
              text={structure?.conclusion || "No clear conclusion"}
              className="text-gray-800"
              maxLength={500000}
            />
          </div>
        </div>
        
        {/* Arrow connecting conclusion and premises */}
        <div className="h-14 w-0.5 bg-gray-300 relative mb-1">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-gray-300"></div>
        </div>
        
        {/* Unstated assumptions - If present */}
        {unstatedAssumptions?.length > 0 && (
          <div className="w-full mb-3">
            <div className="text-center mb-1 text-sm text-gray-500 font-medium">HIDDEN ASSUMPTIONS</div>
            <div className="grid grid-cols-1 gap-2">
              {unstatedAssumptions.map((assumption, index) => (
                <div key={index} className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-sm italic text-gray-700 flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 flex items-center justify-center mr-2 mt-0.5">
                    <span className="text-xs font-semibold text-indigo-700">{index+1}</span>
                  </div>
                  <SafeTextFormatter 
                    text={assumption}
                    className="text-gray-700"
                    maxLength={500000}
                  />
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
                <SafeTextFormatter 
                  text={premise}
                  className="text-green-900"
                  maxLength={500000}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArgumentFlow; 