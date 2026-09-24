import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { analyticsApi } from '../services/api';

export const AnalyticsPage = () => {
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getAnalytics({ days });
      if (res.data.success) setData(res.data.analytics);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const PASTEL_COLORS = ['#8B7BE8', '#78D6B0', '#8FA8E8', '#F4D77A', '#F7C5A8', '#E99A9A'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#26324A] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE]">
              <BarChart3 className="w-5 h-5" />
            </div>
            Productivity Analytics & Planned vs Actual
          </h1>
          <p className="text-xs text-[#718096] mt-1 font-medium">
            Evaluate time estimation accuracy, category distributions, adherence trends, and adaptive insights.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5] self-start sm:self-auto">
          {[
            { label: '7 Days', val: 7 },
            { label: '14 Days', val: 14 },
            { label: '30 Days', val: 30 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDays(item.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                days === item.val
                  ? 'bg-[#FFFFFF] text-[#6450C7] shadow-xs border border-[#E2DCF7]'
                  : 'text-[#718096] hover:text-[#26324A]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="pastel-card p-5 bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">Estimation Accuracy</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#7A68DE] mt-2">
            {data?.summary?.estimationAccuracy || 0}%
          </div>
          <p className="text-[11px] text-[#718096] mt-1 font-medium">Planned vs actual effort</p>
        </div>

        <div className="pastel-card p-5 bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">Average Adherence</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1E7B58] mt-2">
            {data?.summary?.averageAdherence || 0}%
          </div>
          <p className="text-[11px] text-[#718096] mt-1 font-medium">Schedule compliance rate</p>
        </div>

        <div className="pastel-card p-5 bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">Completion Velocity</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#3B5B9E] mt-2">
            {data?.summary?.completionRate || 0}%
          </div>
          <p className="text-[11px] text-[#718096] mt-1 font-medium">
            {data?.summary?.completedCount || 0} of {data?.summary?.totalTasks || 0} tasks
          </p>
        </div>

        <div className="pastel-card p-5 bg-[#FFFFFF]">
          <span className="text-xs text-[#718096] font-bold">Hours Logged</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#D99A1C] mt-2">
            {data?.summary?.totalActualHours || 0}h
          </div>
          <p className="text-[11px] text-[#718096] mt-1 font-medium">
            Planned: {data?.summary?.totalPlannedHours || 0}h
          </p>
        </div>
      </div>

      {/* Adaptive Insights */}
      {data?.insights && data.insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#7A68DE] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Adaptive Scheduling Intelligence Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.insights.map((ins, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  ins.type === 'warning'
                    ? 'bg-[#FEF8E3] border-[#F7E5A0] text-[#8E6814]'
                    : 'bg-[#E4F7F0] border-[#BCECD9] text-[#1E7B58]'
                }`}
              >
                {ins.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-[#8E6814] flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-[#1E7B58] flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-[#26324A]">{ins.title}</div>
                  <div className="text-[11px] mt-0.5 leading-relaxed">{ins.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned vs Actual Trend */}
        <div className="pastel-card p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
          <h3 className="text-xs font-bold text-[#26324A] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8B7BE8]" />
            Planned vs Actual Execution (Hours)
          </h3>
          <div className="h-64">
            {data?.adherenceTrend && data.adherenceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.adherenceTrend}>
                  <XAxis dataKey="date" stroke="#9AA5B8" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9AA5B8" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E2F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#26324A',
                      boxShadow: '0 4px 16px rgba(80, 70, 130, 0.08)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="planned" name="Planned (h)" fill="#8B7BE8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual (h)" fill="#78D6B0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#9AA5B8]">
                Not enough historical trend data yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="pastel-card p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
          <h3 className="text-xs font-bold text-[#26324A] flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-[#8B7BE8]" />
            Category Time Distribution
          </h3>
          <div className="h-64">
            {data?.categoryBreakdown && data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="totalMinutes"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    fontSize={10}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PASTEL_COLORS[index % PASTEL_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E2F0',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: '#26324A',
                      boxShadow: '0 4px 16px rgba(80, 70, 130, 0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#9AA5B8]">
                No category time recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Planned vs Actual Estimation Variance List */}
      <div className="pastel-card p-5 sm:p-6 bg-[#FFFFFF] space-y-4">
        <h3 className="text-xs font-bold text-[#26324A]">Task Estimation Accuracy Ledger</h3>
        {data?.taskEstimationVariances && data.taskEstimationVariances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#718096]">
              <thead className="text-[#9AA5B8] uppercase text-[10px] border-b border-[#F0EDF9] pb-2 font-bold">
                <tr>
                  <th className="pb-2">Task</th>
                  <th className="pb-2">Estimated</th>
                  <th className="pb-2">Actual Tracked</th>
                  <th className="pb-2">Variance</th>
                  <th className="pb-2">Precision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F5F2FC] font-medium">
                {data.taskEstimationVariances.map((v, i) => (
                  <tr key={i} className="hover:bg-[#FAF9FD]">
                    <td className="py-2.5 font-bold text-[#26324A]">{v.title}</td>
                    <td className="py-2.5 font-mono text-[#718096]">{v.estimated}m</td>
                    <td className="py-2.5 font-mono text-[#8B7BE8] font-bold">{v.actual}m</td>
                    <td className="py-2.5 font-mono font-bold">
                      <span className={v.diffMinutes > 0 ? 'text-[#D99A1C]' : 'text-[#1E7B58]'}>
                        {v.diffMinutes > 0 ? `+${v.diffMinutes}m` : `${v.diffMinutes}m`}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-[#26324A]">{v.accuracyPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-[#9AA5B8] text-center py-4">
            Complete tasks to compare planned vs actual durations.
          </p>
        )}
      </div>
    </div>
  );
};
