import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Modal from '../common/Modal';
import { applicationsApi } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export const ApplicationModal = ({ isOpen, onClose, job, onApplicationSuccess }) => {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState('');
  const [useDefaultResume, setUseDefaultResume] = useState(!!user?.resume?.url);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!job) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');

    if (!file) {
      setResumeFile(null);
      return;
    }

    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      setError('Invalid file format. Please upload a PDF, DOC, or DOCX resume.');
      setResumeFile(null);
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5MB maximum limit.');
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!useDefaultResume && !resumeFile) {
      setError('Please select or upload a resume file to submit your application.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('jobId', job._id);
      formData.append('coverLetter', coverLetter);
      formData.append('useDefaultResume', useDefaultResume);

      if (!useDefaultResume && resumeFile) {
        formData.append('resume', resumeFile);
      }

      const res = await applicationsApi.applyForJob(formData);

      if (res.data.success) {
        if (onApplicationSuccess) {
          onApplicationSuccess(res.data.application);
        }
        onClose();
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply to ${job.company}`}
      subtitle={job.title}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Resume Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
            Resume / Curriculum Vitae <span className="text-rose-500">*</span>
          </label>

          {user?.resume?.url && (
            <div className="mb-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 cursor-pointer transition-all">
                <input
                  type="radio"
                  name="resumeChoice"
                  checked={useDefaultResume}
                  onChange={() => {
                    setUseDefaultResume(true);
                    setResumeFile(null);
                  }}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <FileText className="w-5 h-5 text-indigo-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 truncate">
                    {user.resume.originalName || 'Default Profile Resume'}
                  </p>
                  <p className="text-[11px] text-slate-500">Saved in your candidate profile</p>
                </div>
              </label>
            </div>
          )}

          <div>
            {user?.resume?.url && (
              <label className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-600 cursor-pointer">
                <input
                  type="radio"
                  name="resumeChoice"
                  checked={!useDefaultResume}
                  onChange={() => setUseDefaultResume(false)}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                Upload a different resume for this position
              </label>
            )}

            {(!useDefaultResume || !user?.resume?.url) && (
              <div className="mt-2">
                <label className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-indigo-50/30">
                  <Upload className="w-6 h-6 text-slate-400 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">
                    {resumeFile ? resumeFile.name : 'Click to select a resume file'}
                  </span>
                  <span className="text-[11px] text-slate-400 mt-0.5">
                    PDF, DOC, DOCX up to 5MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Cover Letter / Introduction (Optional)
          </label>
          <textarea
            rows="4"
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50/50 hover:bg-white transition-all"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all focus:ring-4 focus:ring-indigo-100 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Submitting Application...
              </>
            ) : (
              'Submit Application'
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ApplicationModal;
