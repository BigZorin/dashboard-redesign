"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

type Period = "7d" | "30d" | "90d"

const data7d = [
  { date: "17 feb", weight: 82.8 },
  { date: "18 feb", weight: 82.5 },
  { date: "19 feb", weight: 82.6 },
  { date: "20 feb", weight: 82.2 },
  { date: "21 feb", weight: 82.0 },
  { date: "22 feb", weight: 82.3 },
  { date: "23 feb", weight: 82.1 },
]

const data30d = [
  { date: "25 jan", weight: 83.8 },
  { date: "28 jan", weight: 83.5 },
  { date: "31 jan", weight: 83.4 },
  { date: "3 feb", weight: 83.2 },
  { date: "6 feb", weight: 83.0 },
  { date: "9 feb", weight: 82.9 },
  { date: "12 feb", weight: 82.7 },
  { date: "15 feb", weight: 82.5 },
  { date: "18 feb", weight: 82.5 },
  { date: "21 feb", weight: 82.3 },
  { date: "23 feb", weight: 82.1 },
]

const data90d = [
  { date: "1 dec", weight: 85.2 },
  { date: "8 dec", weight: 85.0 },
  { date: "15 dec", weight: 84.8 },
  { date: "22 dec", weight: 84.9 },
  { date: "29 dec", weight: 84.5 },
  { date: "5 jan", weight: 84.2 },
  { date: "12 jan", weight: 84.0 },
  { date: "19 jan", weight: 83.7 },
  { date: "26 jan", weight: 83.5 },
  { date: "2 feb", weight: 83.2 },
  { date: "9 feb", weight: 82.9 },
  { date: "16 feb", weight: 82.5 },
  { date: "23 feb", weight: 82.1 },
]

const periodData: Record<Period, typeof data7d> = {
  "7d": data7d,
  "30d": data30d,
  "90d": data90d,
}

const periodLabels: Record<Period, string> = {
  "7d": "7 dagen",
  "30d": "30 dagen",
  "90d": "90 dagen",
}

export function WeightProgress() {
  const [period, setPeriod] = useState<Period>("7d")
  const data = periodData[period]
  const current = data[data.length - 1]!.weight
  const first = data[0]!.weight
  const diff = current - first
  const allWeights = data.map((d) => d.weight)
  const minW = Math.min(...allWeights)
  const maxW = Math.max(...allWeights)
  const domainMin = Math.floor(minW - 0.5)
  const domainMax = Math.ceil(maxW + 0.5)

  return (
    <section className="mx-5 rounded-2xl bg-card p-5 border border-border">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          Gewichtsverloop
        </h2>
      </div>

      <div className="flex items-end gap-3 mb-1">
        <span className="text-3xl font-bold text-foreground font-mono tracking-tight">{current.toFixed(1)}</span>
        <span className="text-base text-muted-foreground mb-0.5">kg</span>
        <div className={`flex items-center gap-1 mb-1 ml-1 px-2 py-0.5 rounded-full ${
          diff < 0 ? "bg-emerald-500/15" : diff > 0 ? "bg-destructive/15" : "bg-secondary"
        }`}>
          {diff < 0 ? (
            <TrendingDown className="h-3 w-3 text-emerald-400" />
          ) : diff > 0 ? (
            <TrendingUp className="h-3 w-3 text-destructive" />
          ) : (
            <Minus className="h-3 w-3 text-muted-foreground" />
          )}
          <span className={`text-xs font-semibold ${
            diff < 0 ? "text-emerald-400" : diff > 0 ? "text-destructive" : "text-muted-foreground"
          }`}>
            {diff > 0 ? "+" : ""}{diff.toFixed(1)}
          </span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Huidig gewicht</p>

      {/* Period toggle */}
      <div className="flex gap-2 mb-4 rounded-xl bg-secondary/50 p-1">
        {(["7d", "30d", "90d"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
              period === p
                ? "bg-[#bad4e1]/20 text-[#bad4e1] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {periodLabels[p]}
          </button>
        ))}
      </div>

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
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[domainMin, domainMax]}
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
              dot={{ r: 3, fill: "#bad4e1", stroke: "oklch(0.18 0.005 270)", strokeWidth: 2 }}
              activeDot={{ r: 6, fill: "#bad4e1", stroke: "oklch(0.18 0.005 270)", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
