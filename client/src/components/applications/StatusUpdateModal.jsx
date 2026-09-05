import React, { useState } from 'react';
import { Loader2, AlertCircle, CheckCircle2, MessageSquare, Tag } from 'lucide-react';
import Modal from '../common/Modal';
import { applicationsApi } from '../../api/axios';

export const StatusUpdateModal = ({
  isOpen,
  onClose,
  application,
  onStatusUpdated,
}) => {
  const [status, setStatus] = useState(application?.status || 'Applied');
  const [notes, setNotes] = useState(application?.notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!application) return null;

  const statuses = [
    { value: 'Applied', label: 'Applied (New Submission)' },
    { value: 'Reviewing', label: 'Under Review' },
    { value: 'Shortlisted', label: 'Shortlisted for Interview' },
    { value: 'Hired', label: 'Hired (Offer Accepted)' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  const rejectionPresets = [
    'Skills do not closely match the core job requirements.',
    'Role has been filled by another candidate.',
    'Looking for candidates with more specialized production experience.',
    'Candidate expectations exceed role compensation band.',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await applicationsApi.updateStatus(application._id, {
        status,
        notes: notes.trim(),
      });

      if (res.data.success) {
        if (onStatusUpdated) {
          onStatusUpdated(res.data.application);
        }
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to update candidate status.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Candidate Status & Feedback"
      subtitle={`Candidate: ${application.applicant?.name || 'Applicant'} • Role: ${application.job?.title || 'Job'}`}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Select Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Rejection Presets if Rejected */}
        {status === 'Rejected' && (
          <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
            <p className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-700" /> Quick Rejection Feedback Templates:
            </p>
            <div className="flex flex-wrap gap-1.5">
              {rejectionPresets.map((preset, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setNotes(preset)}
                  className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-slate-700 hover:bg-amber-100/50 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center justify-between">
            <span>
              {status === 'Rejected'
                ? 'Rejection Feedback & Review (Visible to Candidate)'
                : 'Recruiter Notes / Review Feedback'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Optional</span>
          </label>
          <textarea
            rows="3"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={
              status === 'Rejected'
                ? 'Provide constructive feedback or reasoning for rejection...'
                : 'Add interview notes, screening feedback, or comments...'
            }
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            {status === 'Rejected'
              ? 'Candidate can view this feedback in their "My Applications" dashboard.'
              : 'Feedback helps keep track of candidate progression in the pipeline.'}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
              status === 'Rejected'
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {status === 'Rejected' ? 'Confirm Rejection' : 'Save Status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default StatusUpdateModal;
