import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Target,
  Clock,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-brand-400" />
            Productivity Analytics & Planned vs Actual
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate time estimation accuracy, category distributions, adherence trends, and adaptive insights.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-900 border border-slate-800 self-start sm:self-auto">
          {[
            { label: '7 Days', val: 7 },
            { label: '14 Days', val: 14 },
            { label: '30 Days', val: 30 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => setDays(item.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                days === item.val
                  ? 'bg-brand-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5">
          <span className="text-xs text-slate-400 font-semibold">Estimation Accuracy</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-brand-300 mt-2">
            {data?.summary?.estimationAccuracy || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Planned vs actual effort</p>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs text-slate-400 font-semibold">Average Adherence</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-2">
            {data?.summary?.averageAdherence || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Schedule compliance rate</p>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs text-slate-400 font-semibold">Completion Velocity</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-300 mt-2">
            {data?.summary?.completionRate || 0}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {data?.summary?.completedCount || 0} of {data?.summary?.totalTasks || 0} tasks
          </p>
        </div>

        <div className="glass-panel p-5">
          <span className="text-xs text-slate-400 font-semibold">Hours Logged</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-300 mt-2">
            {data?.summary?.totalActualHours || 0}h
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Planned: {data?.summary?.totalPlannedHours || 0}h
          </p>
        </div>
      </div>

      {/* Adaptive Insights Bar */}
      {data?.insights && data.insights.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Adaptive Scheduling Intelligence Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.insights.map((ins, i) => (
              <div
                key={i}
                className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
                  ins.type === 'warning'
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                }`}
              >
                {ins.type === 'warning' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold">{ins.title}</div>
                  <div className="text-[11px] opacity-85 mt-0.5 leading-relaxed">{ins.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Planned vs Actual Trend */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" />
            Planned vs Actual Execution (Hours)
          </h3>
          <div className="h-64">
            {data?.adherenceTrend && data.adherenceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.adherenceTrend}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="planned" name="Planned (h)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actual" name="Actual (h)" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                Not enough historical trend data yet.
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="glass-panel p-5 sm:p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-brand-400" />
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
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No category time recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Planned vs Actual Estimation Variance List */}
      <div className="glass-panel p-5 sm:p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-100">Task Estimation Accuracy Ledger</h3>
        {data?.taskEstimationVariances && data.taskEstimationVariances.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="text-slate-500 uppercase text-[10px] border-b border-slate-800 pb-2">
                <tr>
                  <th className="pb-2">Task</th>
                  <th className="pb-2">Estimated</th>
                  <th className="pb-2">Actual Tracked</th>
                  <th className="pb-2">Variance</th>
                  <th className="pb-2">Precision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 font-medium">
                {data.taskEstimationVariances.map((v, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-2.5 font-semibold text-slate-200">{v.title}</td>
                    <td className="py-2.5 font-mono text-slate-400">{v.estimated}m</td>
                    <td className="py-2.5 font-mono text-brand-300">{v.actual}m</td>
                    <td className="py-2.5 font-mono">
                      <span className={v.diffMinutes > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                        {v.diffMinutes > 0 ? `+${v.diffMinutes}m` : `${v.diffMinutes}m`}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-slate-300">{v.accuracyPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500 text-center py-4">
            Complete tasks to compare planned vs actual durations.
          </p>
        )}
      </div>
    </div>
  );
};
