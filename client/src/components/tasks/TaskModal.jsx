import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, Plus, Trash2, Tag } from 'lucide-react';
import { categoryApi } from '../../services/api';

export const TaskModal = ({ isOpen, onClose, onSave, task = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState('medium');
  const [estimatedDuration, setEstimatedDuration] = useState(60);
  const [deadline, setDeadline] = useState('');
  const [preferredTimeOfDay, setPreferredTimeOfDay] = useState('any');
  const [categories, setCategories] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      categoryApi.getCategories().then((res) => {
        if (res.data.success) setCategories(res.data.categories);
      });

      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setCategoryId(task.categoryId?._id || task.categoryId || '');
        setPriority(task.priority || 'medium');
        setEstimatedDuration(task.estimatedDuration || 60);
        setDeadline(task.deadline ? new Date(task.deadline).toISOString().slice(0, 16) : '');
        setPreferredTimeOfDay(task.preferredTimeOfDay || 'any');
        setSubtasks(task.subtasks || []);
      } else {
        setTitle('');
        setDescription('');
        setCategoryId('');
        setPriority('medium');
        setEstimatedDuration(60);
        setDeadline('');
        setPreferredTimeOfDay('any');
        setSubtasks([]);
      }
    }
  }, [isOpen, task]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtasks([...subtasks, { title: newSubtaskTitle.trim(), completed: false }]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtask = (idx) => {
    setSubtasks(subtasks.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      title,
      description,
      categoryId: categoryId || null,
      priority,
      estimatedDuration: Number(estimatedDuration),
      deadline: deadline ? new Date(deadline).toISOString() : null,
      preferredTimeOfDay,
      subtasks,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-slate-400">
              Configure estimated effort, priority, and deadlines for automatic scheduling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement user authentication module"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Description</label>
            <textarea
              rows="2"
              placeholder="Add key deliverables or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-brand-500 text-sm"
              >
                <option value="">General (No Category)</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-brand-500 text-sm font-medium"
              >
                <option value="low" className="text-slate-400">Low Priority</option>
                <option value="medium" className="text-blue-400">Medium Priority</option>
                <option value="high" className="text-amber-400">High Priority</option>
                <option value="urgent" className="text-rose-400 font-bold">Urgent (Immediate Boost)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Estimated Duration (Minutes) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Deadline</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-brand-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preferred Time of Day</label>
            <div className="grid grid-cols-4 gap-2">
              {['any', 'morning', 'afternoon', 'evening'].map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setPreferredTimeOfDay(time)}
                  className={`py-2 px-2 text-xs font-medium rounded-xl border capitalize transition-all ${
                    preferredTimeOfDay === time
                      ? 'bg-brand-600/30 border-brand-500 text-brand-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Checklist / Subtasks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-xs focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {subtasks.map((st, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-xs">
                    <span className="text-slate-300">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-sm font-semibold shadow-glow transition-all"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
