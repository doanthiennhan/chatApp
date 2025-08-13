
import React from "react";
import { Bar } from "react-chartjs-2";
import { useTranslation } from 'react-i18next';

interface ShelfShortageData {
  shelf: string;
  hours: number;
  rate: number;
}

interface ShelfShortageChartProps {
  data: ShelfShortageData[];
}

export default function ShelfShortageChart({ data }: ShelfShortageChartProps) {
  const { t } = useTranslation();

  const chartData = {
    labels: data.map(s => s.shelf),
    datasets: [
      {
        label: t("shortage_hours_label"),
        data: data.map(s => s.hours),
        backgroundColor: "#ff7875",
      },
      {
        label: t("shortage_rate_percentage_label"),
        data: data.map(s => s.rate),
        backgroundColor: "#ffd666",
        type: "line" as const,
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
          y: { beginAtZero: true, title: { display: true, text: t("hours_label") } },
          y1: {
            beginAtZero: true,
            position: "right",
            grid: { drawOnChartArea: false },
            title: { display: true, text: t("rate_percentage_label") },
          },
        },
      }}
    />
  );
}