import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";

const ShortageStatusChart = () => {
  const data = {
    labels: ["Beverages", "Fresh food", "Household goods", "Packaged Food", "Personal care"],
    datasets: [
      {
        label: "Total shelf operating hours",
        data: [150, 100, 175, 125, 175],
        backgroundColor: "#D1D5DB",
        borderWidth: 0,
        barPercentage: 0.6,
      },
      {
        label: "Total shelf shortage hours", 
        data: [100, 75, 125, 100, 125],
        backgroundColor: "#6B7280",
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
        max: 200,
      },
    },
    // Add secondary y-axis for shortage rate line
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default ShortageStatusChart; 