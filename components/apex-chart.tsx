"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const baseOptions: ApexOptions = {
  chart: {
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 500
    }
  },
  grid: {
    borderColor: "rgba(255,255,255,0.08)",
    strokeDashArray: 4
  },
  dataLabels: { enabled: false },
  stroke: {
    curve: "smooth",
    width: 2.5
  },
  legend: {
    position: "top",
    horizontalAlign: "left",
    fontSize: "12px",
    labels: { colors: "#b6c0cc" }
  },
  tooltip: {
    theme: "light"
  },
  xaxis: {
    labels: {
      style: {
        colors: "#7c8796",
        fontSize: "11px"
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      style: {
        colors: "#7c8796",
        fontSize: "11px"
      }
    }
  },
  plotOptions: {
    bar: {
      borderRadius: 6
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
  return <Chart type={type} height={height} series={series} options={{ ...baseOptions, ...options, theme: { mode: "dark" } }} />;
}
