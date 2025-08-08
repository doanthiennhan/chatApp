import React from "react";
import { Bar } from "react-chartjs-2";

export default function ShelfShortageChart({ data }) {
  const chartData = {
    labels: data.map(s => s.shelf),
    datasets: [
      {
        label: "Shortage hours",
        data: data.map(s => s.hours),
        backgroundColor: "#ff7875",
      },
      {
        label: "Shortage rate (%)",
        data: data.map(s => s.rate),
        backgroundColor: "#ffd666",
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
          y: { beginAtZero: true, title: { display: true, text: "Hours" } },
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