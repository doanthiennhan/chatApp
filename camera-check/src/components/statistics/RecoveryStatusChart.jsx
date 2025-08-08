import React from "react";
import { Bar } from "react-chartjs-2";

export default function RecoveryStatusChart({ data }) {
  if (!data) {
    return <div>Loading...</div>; // or some other placeholder
  }

  const chartData = {
    labels: data.map(s => s.shelf),
    datasets: [
      {
        label: "Recovery count",
        data: data.map(s => s.count),
        backgroundColor: "#36cfc9",
      },
      {
        label: "On-time recovery rate (%)",
        data: data.map(s => s.rate),
        backgroundColor: "#9254de",
        type: "line",
        yAxisID: "y1",
      },
    ],
  };

  return (
    <Bar
      data={chartData}
      options={{
        plugins: { legend: { display: true } },
        scales: {
          y: { beginAtZero: true, title: { display: true, text: "Count" } },
          y1: {
            beginAtZero: true,
            position: "right",
            grid: { drawOnChartArea: false },
            title: { display: true, text: "Rate (%)" },
          },
        },
      }}
    />
  );
}