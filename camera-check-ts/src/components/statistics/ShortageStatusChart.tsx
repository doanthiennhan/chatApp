
import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { useTranslation } from 'react-i18next';

const ShortageStatusChart = () => {
  const { t } = useTranslation();

  const data = {
    labels: [t("beverages"), t("fresh_food"), t("household_goods"), t("packaged_food"), t("personal_care")],
    datasets: [
      {
        label: t("total_shelf_operating_hours"),
        data: [150, 100, 175, 125, 175],
        backgroundColor: "#D1D5DB",
        borderWidth: 0,
        barPercentage: 0.6,
      },
      {
        label: t("total_shelf_shortage_hours"), 
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