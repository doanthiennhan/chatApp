import React from "react";
import { Line } from "react-chartjs-2";
import Chart from "chart.js/auto";

const ShelfShortageLineChart = () => {
  const data = {
    labels: ["April 1", "April 2", "April 3", "April 4", "April 5"],
    datasets: [
      {
        label: "Average shelf shortage rate",
        data: [24, 26, 25, 28, 26],
        borderColor: "#374151",
        backgroundColor: "rgba(55, 65, 81, 0.1)",
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: "#374151",
        pointBorderColor: "#374151",
        pointRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
        min: 20,
        max: 30,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default ShelfShortageLineChart; 