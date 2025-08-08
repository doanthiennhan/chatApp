import React from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const CustomerVisitOvertimeChart = () => {
  const data = {
    labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    datasets: [
      {
        label: "Operating hour",
        data: [7, 8, 7, 8, 6, 7, 8, 6, 7, 8],
        borderColor: "#374151",
        backgroundColor: "rgba(55, 65, 81, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#374151",
        pointBorderColor: "#374151",
        pointRadius: 3,
        yAxisID: 'y',
      },
      {
        label: "Avg shelf shortage hour",
        data: [4, 5, 4, 5, 3, 4, 5, 3, 4, 5],
        borderColor: "#9CA3AF",
        backgroundColor: "rgba(156, 163, 175, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#9CA3AF",
        pointBorderColor: "#9CA3AF",
        pointRadius: 3,
        yAxisID: 'y',
      },
      {
        label: "Shelf shortage visit",
        data: [6000, 7000, 6500, 7500, 5500, 6000, 7000, 5500, 6000, 7000],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderWidth: 1,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#EF4444",
        pointBorderColor: "#EF4444",
        pointRadius: 2,
        yAxisID: 'y1',
      },
      {
        label: "Store visit (people)",
        data: [8000, 9000, 8500, 9500, 7500, 8000, 9000, 7500, 8000, 9000],
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        borderWidth: 1,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#F59E0B",
        pointBorderColor: "#F59E0B",
        pointRadius: 2,
        yAxisID: 'y1',
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
        type: 'linear',
        display: true,
        position: 'left',
        grid: { color: '#F3F4F6' },
        ticks: { 
          color: '#6B7280',
          font: { size: 10 }
        },
        min: 0,
        max: 10,
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: { drawOnChartArea: false },
        ticks: { 
          color: '#6B7280',
          font: { size: 10 }
        },
        min: 0,
        max: 10000,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default CustomerVisitOvertimeChart; 