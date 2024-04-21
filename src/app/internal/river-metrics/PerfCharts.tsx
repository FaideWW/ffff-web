"use client";

import type { PerfSample } from "@/server/queries";
import { Fragment } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatDate(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hourCycle: "h23",
    hour: "numeric",
    minute: "numeric",
  });
}

function formatTooltipDate(date: Date) {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hourCycle: "h23",
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

export default function PerfCharts({
  data,
  since,
}: {
  data: PerfSample[];
  since: Date;
}) {
  return (
    <div>
      {charts.map((chart) => (
        <Fragment key={chart.dataKey}>
          <h2 className="text-2xl ml-12 my-2">{chart.title}</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 0, left: 50, right: 40 }}
              syncId="sync"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="processedAt"
                tickFormatter={formatDate}
                interval="preserveEnd"
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
