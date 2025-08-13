
import React from "react";
import { Bar } from "react-chartjs-2";
import { useTranslation } from 'react-i18next';

interface RecoveryData {
  shelf: string;
  count: number;
  rate: number;
}

interface RecoveryStatusChartProps {
  data: RecoveryData[];
}

export default function RecoveryStatusChart({ data }: RecoveryStatusChartProps) {
  const { t } = useTranslation();

  if (!data) {
    return <div>{t('loading')}...</div>; // or some other placeholder
  }

  const chartData = {
    labels: data.map(s => s.shelf),
    datasets: [
      {
        label: t("recovery_count_label"),
        data: data.map(s => s.count),
        backgroundColor: "#36cfc9",
      },
      {
        label: t("on_time_recovery_rate_percentage_label"),
        data: data.map(s => s.rate),
        backgroundColor: "#9254de",
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
          y: { beginAtZero: true, title: { display: true, text: t("count_label") } },
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