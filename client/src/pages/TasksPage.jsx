import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Calendar,
  Layers,
  Kanban,
  List,
} from 'lucide-react';
import { taskApi, categoryApi } from '../services/api';
import { TaskModal } from '../components/tasks/TaskModal';
import { useTimer } from '../context/TimerContext';

export const TasksPage = () => {
  const { startSession } = useTimer();
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'kanban'

  // Modals
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, catsRes] = await Promise.all([
        taskApi.getTasks({
          search: search || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          categoryId: categoryFilter || undefined,
        }),
        categoryApi.getCategories(),
      ]);

      if (tasksRes.data.success) setTasks(tasksRes.data.tasks);
      if (catsRes.data.success) setCategories(catsRes.data.categories);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [search, statusFilter, priorityFilter, categoryFilter]);

  const handleSaveTask = async (taskData) => {
    if (selectedTask) {
      await taskApi.updateTask(selectedTask._id, taskData);
    } else {
      await taskApi.createTask(taskData);
    }
    setTaskModalOpen(false);
    setSelectedTask(null);
    fetchTasks();
  };

  const handleComplete = async (taskId) => {
    await taskApi.completeTask(taskId);
    fetchTasks();
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await taskApi.deleteTask(taskId);
      fetchTasks();
    }
  };

  const getPriorityBadge = (priority) => {
    const map = {
      urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      low: 'bg-slate-700/50 text-slate-400 border-slate-700',
    };
    return (
      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${map[priority] || map.medium}`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-brand-400" />
            Task Management & Effort Allocation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize tasks, define deadlines and estimated effort for the intelligent scheduling engine.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTask(null);
            setTaskModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Filter and View Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950 border border-slate-850 self-end md:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold ${
              viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-semibold ${
              viewMode === 'kanban' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List / Kanban View */}
      {viewMode === 'list' ? (
        <div className="glass-panel p-4 sm:p-6 space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              No tasks found. Create your first task to get scheduled!
            </div>
          ) : (
            tasks.map((t) => {
              const isCompleted = t.status === 'completed';
              const progressPercent = Math.min(
                100,
                Math.round(((t.completedDuration || 0) / (t.estimatedDuration || 1)) * 100)
              );

              return (
                <div
                  key={t._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-slate-950/40 border-slate-800/40 opacity-70'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleComplete(t._id)}
                        className={`mt-0.5 p-1 rounded-lg transition-colors ${
                          isCompleted
                            ? 'text-emerald-400'
                            : 'text-slate-600 hover:text-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                            }`}
                          >
                            {t.title}
                          </h3>
                          {getPriorityBadge(t.priority)}
                          {t.categoryId && (
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${t.categoryId.color}20`,
                                color: t.categoryId.color,
                              }}
                            >
                              {t.categoryId.name}
                            </span>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                            {t.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {t.completedDuration || 0}/{t.estimatedDuration} mins
                          </span>

                          {t.deadline && (
                            <span className="flex items-center gap-1 text-amber-400">
                              <Calendar className="w-3.5 h-3.5" />
                              Due: {new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      {!isCompleted && (
                        <button
                          onClick={() => startSession(t._id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-600/30 hover:bg-brand-600/50 text-brand-300 border border-brand-500/30 text-xs font-semibold"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setTaskModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban Columns */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Pending / Backlog', status: 'pending' },
            { title: 'In Progress / Scheduled', status: 'in_progress' },
            { title: 'Completed', status: 'completed' },
          ].map((col) => {
            const colTasks = tasks.filter((t) =>
              col.status === 'in_progress'
                ? t.status === 'in_progress' || t.status === 'scheduled'
                : t.status === col.status
            );

            return (
              <div key={col.status} className="glass-panel p-4 flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {col.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t._id}
                      className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        {getPriorityBadge(t.priority)}
                        <span className="text-[10px] text-slate-500">{t.estimatedDuration}m</span>
                      </div>
                      <h4 className="font-semibold text-slate-200">{t.title}</h4>
                      {t.deadline && (
                        <div className="text-[10px] text-amber-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(t.deadline).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex justify-end gap-1.5 pt-1">
                        {col.status !== 'completed' && (
                          <button
                            onClick={() => startSession(t._id)}
                            className="p-1 rounded bg-brand-600/30 text-brand-300"
                          >
                            <Play className="w-3 h-3 fill-current" />
                          </button>
                        )}
                        <button
                          onClick={() => handleComplete(t._id)}
                          className="p-1 rounded bg-slate-800 text-slate-400 hover:text-emerald-400"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSave={handleSaveTask}
        task={selectedTask}
      />
    </div>
  );
};
