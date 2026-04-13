"use client";
import { Card, Skeleton } from "@luminbridge/ui";
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, IndianRupee } from "lucide-react";

export const AdminAnalytics = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/admin")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading)
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-[450px] rounded-3xl" />
      </div>
    );

  if (!data)
    return (
      <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
        No analytics data found.
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-0 shadow-lg rounded-3xl group hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-100/50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-2xl shadow-inner">
              <TrendingUp size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest uppercase">
                Total Volume
              </p>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
                ₹{data.totalVolume?.toLocaleString() || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-0 shadow-lg rounded-3xl group hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-100/50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 rounded-2xl shadow-inner">
              <IndianRupee size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest uppercase">
                Platform Revenue
              </p>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
                ₹{data.revenue?.toLocaleString() || 0}
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-0 shadow-lg rounded-3xl group hover:scale-[1.02] transition-transform duration-300 ease-out">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-100/50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 rounded-2xl shadow-inner">
              <Users size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold tracking-widest uppercase">
                Active Users
              </p>
              <h3 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight mt-1">
                {data.activeUsers || 0}
              </h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-0 shadow-xl rounded-[2.5rem]">
        <h3 className="text-xl font-semibold text-zinc-900 dark:text-white mb-8 tracking-tight">
          Monthly Sales Volume
        </h3>
        <div className="h-[350px] w-full">
          {data.monthlySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.monthlySales}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e4e4e7"
                  className="dark:opacity-20"
                />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a", fontSize: 10, fontWeight: 700 }}
                  tickFormatter={(value) => `₹${value}`}
                />
                <Tooltip
                  cursor={{ fill: "rgba(244, 244, 245, 0.4)", rx: 12 }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(12px)",
                    padding: "16px",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#18181b"
                  className="dark:fill-white"
                  radius={[8, 8, 8, 8]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 font-medium italic">
              No sales data recorded yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
