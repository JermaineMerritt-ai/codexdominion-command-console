"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SeriesPoint } from "@/types";

const AXIS = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  border: "1px solid hsl(var(--border))",
  borderRadius: 8,
  fontSize: 12,
  color: "hsl(var(--card-foreground))",
};

export function DecisionsAreaChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="gDecisions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Area
          type="monotone"
          dataKey="value"
          name="Decisions"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          fill="url(#gDecisions)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function ViolationsBarChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "hsl(var(--accent))" }} />
        <Bar dataKey="value" name="Violations" radius={[4, 4, 0, 0]} fill="hsl(var(--warning))" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ApprovalTrendsChart({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis dataKey="label" tick={AXIS} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS} tickLine={false} axisLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="value"
          name="Approved"
          stroke="hsl(var(--success))"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="secondary"
          name="Denied"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

const RISK_COLORS: Record<string, string> = {
  Low: "hsl(var(--success))",
  Medium: "hsl(var(--warning))",
  High: "hsl(var(--destructive))",
  Critical: "hsl(0 72% 38%)",
};

export function RiskDonut({ data }: { data: SeriesPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {data.map((d) => (
            <Cell key={d.label} fill={RISK_COLORS[d.label] ?? "hsl(var(--primary))"} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
