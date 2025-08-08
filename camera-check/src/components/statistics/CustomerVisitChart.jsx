import React from "react";
import { Bar } from "react-chartjs-2";

export default function CustomerVisitChart({ data }) {
  return (
    <Bar
      data={data}
      options={{
        plugins: { legend: { display: true } },
        scales: { y: { beginAtZero: true } },
      }}
    />
  );
}