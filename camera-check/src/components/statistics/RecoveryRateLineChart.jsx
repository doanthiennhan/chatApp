import React from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const RecoveryRateLineChart = () => {
  const data = {
    labels: ["April 1", "April 2", "April 3", "April 4", "April 5"],
    datasets: [
      {
        label: "On-time shelf recovery rate",
        data: [62, 64, 61, 60, 62],
        borderColor: "#374151",
        backgroundColor: "rgba(55, 65, 81, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#374151",
        pointBorderColor: "#374151",
        pointRadius: 4,
      },
      {
        label: "Target",
        data: [61, 61, 61, 61, 61],
        borderColor: "#EF4444",
        backgroundColor: "transparent",
        borderWidth: 1,
        borderDash: [5, 5],
        fill: false,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'line',
          font: { size: 10 },
          color: '#6B7280'
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#6B7280',
          font: { size: 10 }
        }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: { 
          color: '#6B7280',
          font: { size: 10 },
          callback: function(value) {
            return value + '%';
          }
        },
        min: 58,
        max: 66,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default RecoveryRateLineChart; 