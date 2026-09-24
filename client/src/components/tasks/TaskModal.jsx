import React, { useState, useEffect } from 'react';
import { X, Clock, Plus, Trash2 } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#26324A]/25 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-xl rounded-3xl bg-[#FFFFFF] border border-[#E2DCF7] shadow-popover p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#F0EDF9]">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#26324A]">
              {task ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-xs text-[#718096]">
              Define effort, priority, and deadlines for intelligent scheduling.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#718096] hover:text-[#26324A] hover:bg-[#F2EFFB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1.5">Task Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement user authentication module"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] placeholder-[#9AA5B8] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium focus:bg-[#FFFFFF]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1.5">Description</label>
            <textarea
              rows="2"
              placeholder="Add key deliverables or notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] placeholder-[#9AA5B8] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium focus:bg-[#FFFFFF]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium"
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
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">Priority Level</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-semibold"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
                <option value="urgent">Urgent (Immediate Boost)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">
                Estimated Duration (Minutes) *
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#9AA5B8] absolute left-3.5 top-3" />
                <input
                  type="number"
                  required
                  min="5"
                  step="5"
                  value={estimatedDuration}
                  onChange={(e) => setEstimatedDuration(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26324A] mb-1.5">Deadline</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] focus:outline-none focus:border-[#8B7BE8] text-xs font-medium"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1.5">Preferred Time of Day</label>
            <div className="grid grid-cols-4 gap-2">
              {['any', 'morning', 'afternoon', 'evening'].map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setPreferredTimeOfDay(time)}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border capitalize transition-all ${
                    preferredTimeOfDay === time
                      ? 'bg-[#ECE9FB] border-[#D0C6F0] text-[#6450C7]'
                      : 'bg-[#FAF9FD] border-[#E5E2F0] text-[#718096] hover:border-[#D6D0EB]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Subtasks */}
          <div>
            <label className="block text-xs font-bold text-[#26324A] mb-1.5">Checklist / Subtasks</label>
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
                className="flex-1 px-3 py-2 rounded-xl bg-[#FAF9FD] border border-[#E5E2F0] text-[#26324A] text-xs placeholder-[#9AA5B8] focus:outline-none focus:border-[#8B7BE8]"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-3 py-2 bg-[#ECE9FB] hover:bg-[#E0DAF7] text-[#7A68DE] rounded-xl text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {subtasks.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {subtasks.map((st, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#FAF9FD] border border-[#EAE7F5] text-xs"
                  >
                    <span className="text-[#26324A] font-medium">{st.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtask(i)}
                      className="text-[#9AA5B8] hover:text-[#9E3B3B]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#F0EDF9]">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary-pastel px-4 py-2.5 text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary-pastel px-5 py-2.5 text-xs shadow-button"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
