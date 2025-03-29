import React from 'react';

const StatCard = ({ title, value, icon, color, textColor }) => {
  return (
    <div className={`${color} h-full rounded-lg shadow-md border-l-4 border-l-${textColor.replace('text-', 'border-')} border-t-0 border-r-0 border-b-0 transition-all hover:shadow-lg`}>
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{title}</h3>
          <div className="text-2xl">{icon}</div>
        </div>
        <p className={`text-xl font-bold ${textColor} line-clamp-2 truncate`}>{value}</p>
      </div>
    </div>
  );
};

export default StatCard; 