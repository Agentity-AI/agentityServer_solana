// TwoLineChart.jsx
import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

function TwoLineChart({ labels, verification, vulnerability }) {
  const data = useMemo(
    () => ({
      labels: labels || [0,0,0,0,0],
      datasets: [
        {
          label: "Verification",
          data: verification || [4,5,6,7],
          borderColor: "#0d59a5",
          backgroundColor: "rgba(13, 89, 165, 0.2)",
          tension: 0.3,
        },
        {
          label: "Vulnerability",
          data: vulnerability || [0,0,0,0,0],
          borderColor: "#f97316",
          backgroundColor: "rgba(249, 115, 22, 0.2)",
          tension: 0.3,
        },
      ],
    }),
    [labels, verification, vulnerability]
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: "#e5e7eb",
          },
        },
      },
      scales: {
        x: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(31,41,55,0.4)" },
        },
        y: {
          ticks: { color: "#9ca3af" },
          grid: { color: "rgba(31,41,55,0.4)" },
        },
      },
    }),
    []
  );

  return <Line data={data} options={options} />;
}

export default TwoLineChart;
