"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Tema escuro (Glassmorphism): grid super suave, texto claro, barras arredondadas, tooltip escuro.
const baseOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 450
    }
  },
  grid: {
    borderColor: "rgba(255, 255, 255, 0.05)",
    strokeDashArray: 5,
    padding: { left: 8, right: 8 }
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: "smooth",
    width: 3
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontSize: "12px",
    labels: { colors: "rgba(255, 255, 255, 0.6)" },
    markers: { strokeWidth: 0 }
  },
  tooltip: {
    theme: "dark"
  },
  xaxis: {
    labels: {
      style: {
        colors: "rgba(255, 255, 255, 0.45)",
        fontSize: "11px"
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: {
        colors: "rgba(255, 255, 255, 0.45)",
        fontSize: "11px"
      }
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 8,
      columnWidth: "48%"
    }
  }
};

export function ApexChart({
  type,
  height,
  series,
  options
}: {
  type: "line" | "area" | "bar" | "donut";
  height: number;
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  options?: ApexOptions;
}) {
  return (
    <Chart
      type={type}
      height={height}
      series={series}
      options={{ ...baseOptions, ...options, theme: { mode: "dark" } }}
    />
  );
}
