
import React from "react";
import { Bar } from "react-chartjs-2";
import { ChartData } from "chart.js";

interface CustomerVisitChartProps {
  data: ChartData<"bar">;
}

export default function CustomerVisitChart({ data }: CustomerVisitChartProps) {
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