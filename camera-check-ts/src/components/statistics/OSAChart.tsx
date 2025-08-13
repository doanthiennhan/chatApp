
import React from "react";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import annotationPlugin from "chartjs-plugin-annotation";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ChartData, ChartOptions } from "chart.js";

Chart.register(annotationPlugin, ChartDataLabels);

interface OSAChartProps {
  data: ChartData<"bar">;
  options: ChartOptions<"bar">;
  title: string;
}

export default function OSAChart({ data, options, title }: OSAChartProps) {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      {title && <h4 style={{ textAlign: 'center', marginBottom: 16 }}>{title}</h4>}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}