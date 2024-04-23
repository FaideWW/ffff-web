"use client";

import type { PerfSample } from "@/server/queries";
import { extent } from "d3-array";
import { scaleLinear } from "d3-scale";
import { Fragment, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatDate(date: number) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });
}

function formatTooltipDate(date: number) {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  });
}

interface ChartData {
  title: string;
  dataKey: string;
  color: string;
}
const charts: ChartData[] = [
  {
    title: "River head drift",
    dataKey: "driftFromHead",
    color: "#8884d8",
  },
  {
    title: "Changeset processing time (ms)",
    dataKey: "timeTaken",
    color: "#82ca9d",
  },
  {
    title: "Stashes per changeset",
    dataKey: "stashCount",
    color: "#ff7300",
  },
];

const OPTIMAL_TICK_COUNT = 20;
export default function PerfCharts({
  data,
}: {
  data: PerfSample[];
  since: Date;
  scale: "m" | "h" | "d";
}) {
  const processedData = useMemo(() => {
    return data.map((d) => {
      return { ...d, processedAt: d.processedAt.getTime() };
    });
  }, [data]);

  const scale = useMemo(() => {
    const domain = extent(processedData.map((d) => d.processedAt));
    if (domain[0] === undefined || domain[1] === undefined) {
      return undefined;
    }
    return scaleLinear().domain(domain);
  }, [processedData]);

  return (
    <div>
      {charts.map((chart) => (
        <Fragment key={chart.dataKey}>
          <h2 className="text-2xl ml-12 my-2">{chart.title}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={processedData}
              margin={{ top: 0, left: 50, right: 40 }}
              syncId="sync"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="processedAt"
                tickFormatter={formatDate}
                domain={scale?.domain()}
                ticks={scale?.ticks(OPTIMAL_TICK_COUNT)}
                scale="time"
                type="number"
              />
              <YAxis />
              <Area
                type="monotone"
                dataKey={chart.dataKey}
                stroke={chart.color}
                fill={chart.color}
                dot={false}
              />
              <Tooltip
                labelClassName="text-slate-800"
                labelFormatter={formatTooltipDate}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Fragment>
      ))}
    </div>
  );
}
