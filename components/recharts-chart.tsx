"use client";

import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { formatBRL } from "@/lib/formatters";

interface RechartsChartProps {
  type: "line" | "area" | "bar" | "donut";
  height: number;
  series: any;
  options?: any;
}

export function RechartsChart({ type, height, series, options }: RechartsChartProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        style={{ height }} 
        className="w-full flex items-center justify-center rounded-[24px] border border-white/5 bg-slate-950/20 backdrop-blur-md text-sm text-text-soft"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-lime border-t-transparent" />
          <span className="text-xs font-medium tracking-wide">Carregando gráfico...</span>
        </div>
      </div>
    );
  }

  // Extract colors
  const colors = options?.colors || ["#9fe870", "#60a5fa", "#c084fc", "#fb923c", "#f87171"];
  const categories = options?.xaxis?.categories || [];

  // Transform standard Apex format [ { name: "X", data: [1, 2, 3] } ] to Recharts format
  let chartData: any[] = [];
  if (type !== "donut") {
    if (categories.length > 0 && Array.isArray(series)) {
      chartData = categories.map((cat: string, catIdx: number) => {
        const item: any = { name: cat };
        series.forEach((s) => {
          if (s && s.data) {
            item[s.name] = s.data[catIdx];
          }
        });
        return item;
      });
    }
  }

  // Custom Glassmorphism Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-white/10 bg-slate-950/85 p-3.5 shadow-[0_15px_50px_rgba(0,0,0,0.85),_0_0_25px_rgba(159,232,112,0.08)] backdrop-blur-2xl ring-1 ring-white/10">
          {label && <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-soft mb-2 border-b border-white/5 pb-1">{label}</p>}
          <div className="space-y-1.5">
            {payload.map((p: any, i: number) => {
              const val = typeof p.value === "number" ? formatBRL(p.value) : p.value;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color || p.fill, color: p.color || p.fill }} />
                  <span className="text-xs text-text-soft font-medium">{p.name}:</span>
                  <span className="text-xs font-bold text-lime tabular-nums ml-auto">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom SVG Definitions and Gradients for true 3D aesthetic
  const globalDefs = (
    <svg className="absolute h-0 w-0 pointer-events-none" aria-hidden="true" style={{ width: 0, height: 0 }}>
      <defs>
        {/* Glow Filter for Lines and Areas */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Subtle Drop Shadow Filter for Bars */}
        <filter id="bar-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#000" floodOpacity="0.5" />
        </filter>
        {/* Rich Volumetric Gradients for Bar fills */}
        <linearGradient id="bar-grad-lime" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9fe870" />
          <stop offset="100%" stopColor="#1e3a10" />
        </linearGradient>
        <linearGradient id="bar-grad-blue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#172554" />
        </linearGradient>
        <linearGradient id="bar-grad-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#3b0764" />
        </linearGradient>
        <linearGradient id="bar-grad-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fb923c" />
          <stop offset="100%" stopColor="#431407" />
        </linearGradient>
        <linearGradient id="bar-grad-red" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f87171" />
          <stop offset="100%" stopColor="#450a0a" />
        </linearGradient>
      </defs>
    </svg>
  );

  const gradientMap: Record<string, string> = {
    "#9fe870": "url(#bar-grad-lime)",
    "#60a5fa": "url(#bar-grad-blue)",
    "#c084fc": "url(#bar-grad-purple)",
    "#fb923c": "url(#bar-grad-orange)",
    "#f87171": "url(#bar-grad-red)",
  };

  const getBarFill = (baseColor: string) => {
    return gradientMap[baseColor.toLowerCase()] || baseColor;
  };

  // 1. AREA CHART (using ComposedChart to separate volumetric fill from glowing neon line)
  if (type === "area" && Array.isArray(series)) {
    return (
      <>
        {globalDefs}
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <defs>
                {series.map((s, idx) => (
                  <linearGradient key={`grad-${s.name}`} id={`color-${s.name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colors[idx % colors.length]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={colors[idx % colors.length]} stopOpacity={0.0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  if (Math.abs(v) >= 1000) return `R$ ${Math.round(v / 1000)}k`;
                  return `R$ ${v}`;
                }}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }} />
              {options?.legend?.show !== false && (
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-text-soft font-medium mr-2">{value}</span>}
                />
              )}
              {series.map((s, idx) => (
                <React.Fragment key={s.name}>
                  {/* Glowing Outline Line */}
                  <Line
                    type="monotone"
                    dataKey={s.name}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={3}
                    dot={{ r: 3.5, strokeWidth: 1.5, stroke: "#030712", fill: colors[idx % colors.length] }}
                    activeDot={{ r: 5.5, strokeWidth: 0, fill: colors[idx % colors.length] }}
                    filter="url(#neon-glow)"
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                  {/* Gradient Area Fill under the line */}
                  <Area
                    type="monotone"
                    dataKey={s.name}
                    stroke="none"
                    fillOpacity={1}
                    fill={`url(#color-${s.name})`}
                    isAnimationActive={true}
                    animationDuration={800}
                  />
                </React.Fragment>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }

  // 2. LINE CHART
  if (type === "line" && Array.isArray(series)) {
    return (
      <>
        {globalDefs}
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  if (Math.abs(v) >= 1000) return `R$ ${Math.round(v / 1000)}k`;
                  return `R$ ${v}`;
                }}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: 1 }} />
              {options?.legend?.show !== false && (
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-text-soft font-medium mr-2">{value}</span>}
                />
              )}
              {series.map((s, idx) => {
                const hasDashArray = options?.stroke?.dashArray && options.stroke.dashArray[idx] > 0;
                return (
                  <Line
                    key={s.name}
                    type="monotone"
                    dataKey={s.name}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={3}
                    strokeDasharray={hasDashArray ? `${options.stroke.dashArray[idx]} ${options.stroke.dashArray[idx]}` : undefined}
                    dot={{ r: 4, strokeWidth: 1.5, stroke: "#030712", fill: colors[idx % colors.length] }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: colors[idx % colors.length] }}
                    connectNulls={true}
                    filter="url(#neon-glow)"
                    isAnimationActive={true}
                    animationDuration={850}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }

  // 3. BAR CHART
  if (type === "bar" && Array.isArray(series)) {
    const isDistributed = options?.plotOptions?.bar?.distributed === true;

    return (
      <>
        {globalDefs}
        <div style={{ width: "100%", height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255, 255, 255, 0.04)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="rgba(255, 255, 255, 0.3)" 
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => {
                  if (Math.abs(v) >= 1000) return `R$ ${Math.round(v / 1000)}k`;
                  return `R$ ${v}`;
                }}
                dx={-5}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.02)" }} />
              {options?.legend?.show !== false && !isDistributed && (
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(value) => <span className="text-xs text-text-soft font-medium mr-2">{value}</span>}
                />
              )}
              {series.map((s, idx) => (
                <Bar
                  key={s.name}
                  dataKey={s.name}
                  radius={[8, 8, 0, 0]}
                  maxBarSize={45}
                  filter="url(#bar-shadow)"
                  isAnimationActive={true}
                  animationDuration={800}
                >
                  {chartData.map((entry, entryIdx) => {
                    let cellFill = colors[idx % colors.length];
                    if (isDistributed && colors[entryIdx]) {
                      cellFill = colors[entryIdx];
                    }
                    return (
                      <Cell 
                        key={`cell-${entryIdx}`} 
                        fill={getBarFill(cellFill)} 
                        className="transition-opacity hover:opacity-85 duration-200"
                      />
                    );
                  })}
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }

  // 4. DONUT CHART (PIE)
  if (type === "donut") {
    // Treat series as direct numbers [64, 18, 18] and labels from options
    const rawData = Array.isArray(series) ? series : [];
    const labels = options?.labels || [];
    const donutData = rawData.map((val: number, idx: number) => ({
      name: labels[idx] || `Item ${idx}`,
      value: val
    }));

    return (
      <>
        {globalDefs}
        <div style={{ width: "100%", height }} className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={4}
                dataKey="value"
                isAnimationActive={true}
                animationDuration={850}
              >
                {donutData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarFill(colors[index % colors.length])} 
                    stroke="rgba(3, 7, 18, 0.6)"
                    strokeWidth={2}
                    filter="url(#bar-shadow)"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="middle" 
                align="right" 
                layout="vertical" 
                iconType="circle" 
                iconSize={8}
                formatter={(value) => <span className="text-xs text-text-soft font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  }

  return <div style={{ height }} className="w-full flex items-center justify-center text-text-faint text-xs">Tipo de gráfico não suportado</div>;
}
