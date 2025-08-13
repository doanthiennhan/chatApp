
import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { useTranslation } from 'react-i18next';

const RecoveryStatusBarChart = () => {
  const { t } = useTranslation();

  const data = {
    labels: [t("beverages"), t("fresh_food"), t("household_goods"), t("packaged_food"), t("personal_care")],
    datasets: [
      {
        label: t("number_of_replenishment_alerts"),
        data: [50, 75, 25, 50, 75],
        backgroundColor: "#9CA3AF",
        borderWidth: 0,
        barPercentage: 0.6,
      },
      {
        label: t("number_of_on_time_shelf_recovery"),
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