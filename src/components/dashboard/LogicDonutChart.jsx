import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

const LogicDonutChart = ({ data }) => {
  const chartData = {
    labels: ['Necessary Assumptions', 'Flaws', 'Sufficient Assumptions', 'Quantifiers'],
    datasets: [
      {
        data: [
          data.necessaryAssumptions,
          data.flaws,
          data.sufficientAssumptions,
          data.quantifiers
        ],
        backgroundColor: [
          'rgba(139, 92, 246, 0.8)',  // purple for necessary assumptions
          'rgba(239, 68, 68, 0.8)',   // red for flaws
          'rgba(59, 130, 246, 0.8)',   // blue for sufficient assumptions
          'rgba(249, 115, 22, 0.8)',   // orange for quantifiers
        ],
        borderColor: [
          'rgba(139, 92, 246, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(249, 115, 22, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          boxWidth: 8,
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#334155',
        bodyColor: '#334155',
        borderColor: '#e2e8f0',
        borderWidth: 1,
        cornerRadius: 8,
        boxPadding: 4,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}%`;
          }
        }
      }
    }
  };

  return (
    <div className="bg-white h-full rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-800">Logical Component Breakdown</h3>
      </div>
      <div className="p-4 flex items-center justify-center">
        <div className="h-60 md:h-72 w-full">
          <Doughnut data={chartData} options={options} />
        </div>
      </div>
    </div>
  );
};

export default LogicDonutChart; 