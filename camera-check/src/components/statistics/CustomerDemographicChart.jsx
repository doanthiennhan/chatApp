import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const CustomerDemographicChart = () => {
  const data = {
    labels: ["10-19", "20-29", "30-39", "40-49"],
    datasets: [
      {
        label: "Female",
        data: [18000, 22000, 15000, 8000],
        backgroundColor: "#9CA3AF",
        borderWidth: 0,
        barPercentage: 0.8,
      },
      {
        label: "Male",
        data: [12000, 18000, 12000, 6000],
        backgroundColor: "#6B7280",
        borderWidth: 0,
        barPercentage: 0.8,
      },
      {
        label: "Other",
        data: [2000, 3000, 2000, 1000],
        backgroundColor: "#374151",
        borderWidth: 0,
        barPercentage: 0.8,
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
          font: { size: 10 }
        }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: { 
          color: '#6B7280',
          font: { size: 9 },
          callback: function(value) {
            return (value / 1000) + 'k';
          }
        },
        min: 0,
        max: 25000,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default CustomerDemographicChart; 