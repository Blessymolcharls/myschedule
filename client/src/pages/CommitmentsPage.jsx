import React, { useState, useEffect } from 'react';
import { Lock, Plus, Trash2, Edit2, Clock, Calendar, Repeat, ShieldCheck } from 'lucide-react';
import { commitmentApi } from '../services/api';
import { CommitmentModal } from '../components/commitments/CommitmentModal';

export const CommitmentsPage = () => {
  const [commitments, setCommitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCommitment, setSelectedCommitment] = useState(null);

  const fetchCommitments = async () => {
    try {
      setLoading(true);
      const res = await commitmentApi.getCommitments();
      if (res.data.success) setCommitments(res.data.commitments);
    } catch (err) {
      console.error('Failed to load commitments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommitments();
  }, []);

  const handleSave = async (data) => {
    if (selectedCommitment) {
      await commitmentApi.updateCommitment(selectedCommitment._id, data);
    } else {
      await commitmentApi.createCommitment(data);
    }
    setModalOpen(false);
    setSelectedCommitment(null);
    fetchCommitments();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this fixed commitment? The scheduler will free up this time block.')) {
      await commitmentApi.deleteCommitment(id);
      fetchCommitments();
    }
  };

  const DAYS_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2.5">
            <Lock className="w-6 h-6 text-rose-400" />
            Fixed Commitments & Hard Constraints
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Define immovable periods (classes, office shifts, recurring meetings). The auto-scheduler will strictly route around them.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCommitment(null);
            setModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-glow transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Fixed Commitment</span>
        </button>
      </div>

      {/* Info Callout */}
      <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <span className="font-bold text-rose-300">Deterministic Protection:</span> Fixed commitments are treated as immutable blocks. When you create or modify a commitment, the Dynamic Rescheduling Engine immediately re-optimizes any overlapping flexible tasks into the next available free windows.
        </div>
      </div>

      {/* Commitments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {commitments.length === 0 ? (
          <div className="col-span-full glass-panel p-12 text-center text-slate-500 text-sm">
            No fixed commitments defined. Click "Add Fixed Commitment" to block out lectures, office hours, or appointments.
          </div>
        ) : (
          commitments.map((c) => (
            <div
              key={c._id}
              className="glass-panel p-5 space-y-3 relative overflow-hidden border-rose-500/20 hover:border-rose-500/40 transition-all"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100">{c.title}</h3>
                    {c.isRecurring ? (
                      <span className="text-[10px] text-brand-300 font-semibold flex items-center gap-1 mt-0.5">
                        <Repeat className="w-3 h-3" />
                        {c.recurrencePattern === 'daily'
                          ? 'Repeats Daily'
                          : c.recurrencePattern === 'weekdays'
                          ? 'Mon - Fri'
                          : `Weekly (${c.daysOfWeek?.map((d) => DAYS_MAP[d]).join(', ')})`}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">One-off Block</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSelectedCommitment(c);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex items-center justify-between font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {!c.isRecurring && (
                  <span className="text-[11px] text-slate-500 font-sans">
                    {new Date(c.startTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <CommitmentModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedCommitment(null);
        }}
        onSave={handleSave}
        commitment={selectedCommitment}
      />
    </div>
  );
};
