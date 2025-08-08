import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const RecoveryStatusBarChart = () => {
  const data = {
    labels: ["Beverages", "Fresh food", "Household goods", "Packaged Food", "Personal care"],
    datasets: [
      {
        label: "Number of replenishment alerts",
        data: [50, 75, 25, 50, 75],
        backgroundColor: "#9CA3AF",
        borderWidth: 0,
        barPercentage: 0.6,
      },
      {
        label: "Number of on-time shelf recovery",
        data: [25, 50, 15, 25, 50],
        backgroundColor: "#374151",
        borderWidth: 0,
        barPercentage: 0.6,
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
          font: { size: 9 },
          color: '#6B7280'
        }
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: '#6B7280',
          font: { size: 9 },
          maxRotation: 45
        }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: { 
          color: '#6B7280',
          font: { size: 9 }
        },
        min: 0,
        max: 80,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default RecoveryStatusBarChart; 