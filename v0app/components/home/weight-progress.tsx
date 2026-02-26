"use client"

import { TrendingUp } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

const data = [
  { date: "15 feb", weight: 125.0 },
  { date: "16 feb", weight: 125.5 },
  { date: "17 feb", weight: 123.0 },
  { date: "18 feb", weight: 126.0 },
  { date: "20 feb", weight: 131.0 },
]

export function WeightProgress() {
  return (
    <section className="mx-5 rounded-2xl bg-card p-5 border border-border">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          Gewichtsverloop
        </h2>
      </div>

      <div className="flex items-end gap-3 mb-1">
        <span className="text-3xl font-bold text-foreground font-mono tracking-tight">131.0</span>
        <span className="text-base text-muted-foreground mb-0.5">kg</span>
        <div className="flex items-center gap-1 mb-1 ml-1 px-2 py-0.5 rounded-full bg-destructive/15">
          <TrendingUp className="h-3 w-3 text-destructive" />
          <span className="text-xs font-semibold text-destructive">+6.0</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Huidig gewicht</p>

      <div className="h-44 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#bad4e1" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#bad4e1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="oklch(0.25 0.008 270)"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
              dy={8}
            />
            <YAxis
              domain={[121, 133]}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }}
              dx={-4}
            />
            <Tooltip
              contentStyle={{
                background: "oklch(0.22 0.008 270)",
                border: "1px solid oklch(0.25 0.008 270)",
                borderRadius: "12px",
                color: "oklch(0.97 0 0)",
                fontSize: "12px",
                padding: "8px 12px",
              }}
              labelStyle={{ color: "oklch(0.6 0 0)" }}
              formatter={(value: number) => [`${value} kg`, "Gewicht"]}
            />
            <Area
              type="monotone"
              dataKey="weight"
              stroke="#bad4e1"
              strokeWidth={2.5}
              fill="url(#weightGradient)"
              dot={{ r: 4, fill: "#bad4e1", stroke: "oklch(0.18 0.005 270)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#bad4e1", stroke: "oklch(0.18 0.005 270)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
