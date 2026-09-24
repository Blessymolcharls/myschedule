import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Play,
  CheckCircle2,
  Trash2,
  Edit2,
  Clock,
  Calendar,
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
  const [viewMode, setViewMode] = useState('list');

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
      urgent: 'bg-[#FDECEC] text-[#9E3B3B] border-[#F7C8C8]',
      high: 'bg-[#FEF8E3] text-[#8E6814] border-[#F7E5A0]',
      medium: 'bg-[#EEF2FC] text-[#3B5B9E] border-[#D0DDF7]',
      low: 'bg-[#FAF9FD] text-[#718096] border-[#E5E2F0]',
    };
    return (
      <span
        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
          map[priority] || map.medium
        }`}
      >
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#26324A] flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE]">
              <CheckSquare className="w-5 h-5" />
            </div>
            Task Management & Effort Allocation
          </h1>
          <p className="text-xs text-[#718096] mt-1 font-medium">
            Organize tasks, define deadlines and estimated effort for the intelligent scheduling engine.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedTask(null);
            setTaskModalOpen(true);
          }}
          className="btn-primary-pastel flex items-center gap-2 px-4 py-2 text-xs font-bold shadow-button self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Filter and View Bar */}
      <div className="pastel-card p-4 bg-[#FFFFFF] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-[#9AA5B8] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-xs text-[#26324A] placeholder-[#9AA5B8] focus:outline-none focus:border-[#8B7BE8] font-medium"
            />
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-xs font-semibold text-[#26324A] focus:outline-none focus:border-[#8B7BE8]"
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
            className="px-3.5 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-xs font-semibold text-[#26324A] focus:outline-none focus:border-[#8B7BE8]"
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
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5] self-end md:self-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold ${
              viewMode === 'list'
                ? 'bg-[#FFFFFF] text-[#6450C7] shadow-xs border border-[#E2DCF7]'
                : 'text-[#718096] hover:text-[#26324A]'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-semibold ${
              viewMode === 'kanban'
                ? 'bg-[#FFFFFF] text-[#6450C7] shadow-xs border border-[#E2DCF7]'
                : 'text-[#718096] hover:text-[#26324A]'
            }`}
          >
            <Kanban className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Task List / Kanban View */}
      {viewMode === 'list' ? (
        <div className="pastel-card p-5 bg-[#FFFFFF] space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-12 text-[#9AA5B8] text-sm">
              No tasks found. Create your first task to get scheduled!
            </div>
          ) : (
            tasks.map((t) => {
              const isCompleted = t.status === 'completed';

              return (
                <div
                  key={t._id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isCompleted
                      ? 'bg-[#FAF9FD] border-[#EAE7F5] opacity-75'
                      : 'bg-[#FBFAFF] border-[#EAE7F5] hover:border-[#D6D0EB] shadow-xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <button
                        onClick={() => handleComplete(t._id)}
                        className={`mt-0.5 p-1 rounded-lg transition-colors ${
                          isCompleted
                            ? 'text-[#1E7B58]'
                            : 'text-[#9AA5B8] hover:text-[#1E7B58]'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`text-sm font-bold truncate ${
                              isCompleted ? 'line-through text-[#9AA5B8]' : 'text-[#26324A]'
                            }`}
                          >
                            {t.title}
                          </h3>
                          {getPriorityBadge(t.priority)}
                          {t.categoryId && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${t.categoryId.color}15`,
                                color: t.categoryId.color,
                              }}
                            >
                              {t.categoryId.name}
                            </span>
                          )}
                        </div>

                        {t.description && (
                          <p className="text-xs text-[#718096] mt-1 line-clamp-1">
                            {t.description}
                          </p>
                        )}

                        {/* Metadata row */}
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#718096]">
                          <span className="flex items-center gap-1 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#9AA5B8]" />
                            {t.completedDuration || 0}/{t.estimatedDuration} mins
                          </span>

                          {t.deadline && (
                            <span className="flex items-center gap-1 text-[#8E6814] font-semibold">
                              <Calendar className="w-3.5 h-3.5" />
                              Due: {new Date(t.deadline).toLocaleDateString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
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
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#ECE9FB] hover:bg-[#E0DAF7] text-[#7A68DE] border border-[#D0C6F0] text-xs font-bold transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Focus</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setSelectedTask(t);
                          setTaskModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FAF9FD] text-[#718096] hover:text-[#26324A] border border-[#E5E2F0]"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(t._id)}
                        className="p-1.5 rounded-xl bg-[#FFFFFF] hover:bg-[#FDECEC] text-[#718096] hover:text-[#9E3B3B] border border-[#E5E2F0]"
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
              <div key={col.status} className="pastel-card p-4 bg-[#FFFFFF] flex flex-col min-h-[450px]">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#F0EDF9]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#718096]">
                    {col.title}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#ECE9FB] text-[#7A68DE] font-bold">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t._id}
                      className="p-3.5 rounded-xl bg-[#FBFAFF] border border-[#EAE7F5] hover:border-[#D6D0EB] space-y-2 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        {getPriorityBadge(t.priority)}
                        <span className="text-[10px] text-[#718096] font-medium">{t.estimatedDuration}m</span>
                      </div>
                      <h4 className="font-bold text-[#26324A]">{t.title}</h4>
                      {t.deadline && (
                        <div className="text-[10px] text-[#8E6814] font-semibold flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(t.deadline).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex justify-end gap-1.5 pt-1">
                        {col.status !== 'completed' && (
                          <button
                            onClick={() => startSession(t._id)}
                            className="p-1.5 rounded-lg bg-[#ECE9FB] text-[#7A68DE]"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                          </button>
                        )}
                        <button
                          onClick={() => handleComplete(t._id)}
                          className="p-1.5 rounded-lg bg-[#FFFFFF] text-[#718096] hover:text-[#1E7B58] border border-[#E5E2F0]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
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
