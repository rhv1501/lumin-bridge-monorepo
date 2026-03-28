"use client";
import { Card } from "@luminbridge/ui";
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Eye } from 'lucide-react';

export function FactoryAnalytics({ factoryId }: { factoryId: number }) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/analytics/factory/${factoryId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [factoryId]);

  if (!data) return <div className="p-4 text-zinc-500">Loading analytics...</div>;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-8 border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 rounded-[2rem] group">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-2xl group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Total Sales</p>
              <h3 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">¥{data.totalSales?.toLocaleString() || 0}</h3>
            </div>
          </div>
        </Card>
        
        <Card className="p-8 border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 rounded-[2rem] group">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl group-hover:scale-110 transition-transform duration-500">
              <Target size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Proposal Conversion</p>
              <h3 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{data.conversionRate?.toFixed(1) || 0}%</h3>
            </div>
          </div>
        </Card>

        <Card className="p-8 border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl hover:shadow-xl transition-all duration-300 rounded-[2rem] group">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-2xl group-hover:scale-110 transition-transform duration-500">
              <Eye size={28} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-1">Profile Views</p>
              <h3 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">{data.profileViews || 0}</h3>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-8 border-0 shadow-lg bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem]">
        <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-8">Monthly Sales Volume</h3>
        <div className="h-[350px] w-full">
          {data.monthlySales?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlySales} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 12 }} 
                  className="text-zinc-500 dark:text-zinc-400"
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'currentColor', fontSize: 12 }} 
                  className="text-zinc-500 dark:text-zinc-400"
                  tickFormatter={(value) => `¥${value}`} 
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(12px)',
                    color: '#18181b',
                    padding: '12px 16px',
                    fontWeight: 500
                  }}
                  itemStyle={{ color: '#18181b', fontWeight: 600 }}
                  formatter={(value: any) => [`¥${Number(value).toLocaleString()}`, 'Sales']}
                />
                <Bar 
                  dataKey="sales" 
                  fill="currentColor" 
                  className="text-zinc-900 dark:text-white"
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-700">
              No sales data available yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
