import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X, Sparkles, ArrowRight, Loader2, Minus } from 'lucide-react';
import { JobProgress } from '../../types/index.js';

interface UploadLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLectureReady: (lectureId: string) => void;
  onJobUpdate?: (job: JobProgress | null) => void;
}

export const UploadLectureModal: React.FC<UploadLectureModalProps> = ({
  isOpen,
  onClose,
  onLectureReady,
  onJobUpdate,
}) => {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('uniplay_active_job_id');
    }
    return null;
  });
  const [jobProgress, setJobProgress] = useState<JobProgress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<any>(null);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

  // Poll job status when jobId is set
  useEffect(() => {
    if (!jobId) {
      if (onJobUpdate) onJobUpdate(null);
      return;
    }

    // Immediately poll once
    const checkJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) {
          if (res.status === 404) {
            localStorage.removeItem('uniplay_active_job_id');
            setJobId(null);
            setJobProgress(null);
            if (onJobUpdate) onJobUpdate(null);
          }
          return;
        }
        const data: JobProgress = await res.json();
        setJobProgress(data);
        if (onJobUpdate) onJobUpdate(data);

        if (data.status === 'completed' && data.lectureId) {
          clearInterval(pollIntervalRef.current);
          localStorage.removeItem('uniplay_active_job_id');
          setTimeout(() => {
            onLectureReady(data.lectureId!);
            handleReset();
            onClose();
          }, 1000);
        } else if (data.status === 'failed') {
          clearInterval(pollIntervalRef.current);
          localStorage.removeItem('uniplay_active_job_id');
          setErrorMessage(data.errorMessage || 'Something went wrong while processing your lecture. Please retry.');
        }
      } catch (err) {
        console.error('Job polling error:', err);
      }
    };

    checkJob();
    pollIntervalRef.current = setInterval(checkJob, 700);

    return () => clearInterval(pollIntervalRef.current);
  }, [jobId]);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage(null);
    setSelectedPreset(null);

    // Validate size (max 35MB)
    if (file.size > 35 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 35 MB limit. Please upload a smaller lecture document.');
      return;
    }

    // Validate extension
    const name = file.name.toLowerCase();
    if (!name.endsWith('.pdf') && !name.endsWith('.txt') && !name.endsWith('.md')) {
      setErrorMessage('That file could not be read. Please upload a valid PDF lecture.');
      return;
    }

    setSelectedFile(file);
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
    }
  };

  const handleSelectPreset = (key: string, title: string) => {
    setSelectedPreset(key);
    setSelectedFile(null);
    setCustomTitle(title);
    setErrorMessage(null);
  };

  const startProcessing = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      let res;
      if (selectedPreset) {
        res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ presetKey: selectedPreset, title: customTitle }),
        });
      } else if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('title', customTitle || selectedFile.name);
        res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
      } else {
        setErrorMessage('Please select a lecture file or a preset curriculum to continue.');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.errorMessage || 'Upload failed');
      }

      const data = await res.json();
      localStorage.setItem('uniplay_active_job_id', data.jobId);
      setJobId(data.jobId);
    } catch (err: any) {
      setErrorMessage(err.message || 'That file could not be read. Please upload a valid PDF lecture.');
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('uniplay_active_job_id');
    setSelectedFile(null);
    setSelectedPreset(null);
    setCustomTitle('');
    setJobId(null);
    setJobProgress(null);
    setIsSubmitting(false);
    setErrorMessage(null);
    if (onJobUpdate) onJobUpdate(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto">
        {/* Header Action Buttons */}
        <div className="absolute top-6 right-6 flex items-center gap-1.5">
          {jobId && (
            <button
              onClick={onClose}
              title="Minimize to background"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition text-xs flex items-center gap-1.5 px-3 border border-slate-700/60"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Minimize</span>
            </button>
          )}
          <button
            onClick={() => {
              if (jobId && jobProgress?.status === 'failed') {
                handleReset();
              }
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI LECTURE COMPILER</span>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Upload Lecture PDF</h3>
          <p className="text-sm text-slate-400 mt-1">
            UNIPLAY will analyze your lecture, create an animated visual lesson, grounded quizzes, and 8 playable educational games.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-sm mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block mb-0.5">Upload Error</span>
              <span>{errorMessage}</span>
              {jobId && (
                <button
                  onClick={handleReset}
                  className="mt-2 text-xs font-bold underline text-rose-300 hover:text-white block"
                >
                  Clear and upload another document
                </button>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE JOB PROGRESS SCREEN */}
        {jobProgress ? (
          <div className="py-6 flex flex-col items-center text-center">
            {/* Stage Indicator Graphic */}
            <div className="relative w-24 h-24 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-slate-800" />
              <div
                className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"
                style={{ animationDuration: '2s' }}
              />
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-lg text-white">
                {jobProgress.progress}%
              </div>
            </div>

            <h4 className="text-xl font-bold text-white mb-2">{jobProgress.message}</h4>
            <p className="text-sm text-slate-400 max-w-md mb-6">{jobProgress.subMessage}</p>

            {/* Stage Progress Bar */}
            <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 mb-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${jobProgress.progress}%` }}
              />
            </div>

            {/* Stages Checkbox List */}
            <div className="w-full bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 text-left font-mono text-xs flex flex-col gap-2 mb-4">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Document received & verified</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  jobProgress.progress >= 30 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {jobProgress.progress >= 30 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>Understanding lecture knowledge base</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  jobProgress.progress >= 55 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {jobProgress.progress >= 55 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>Creating visual lesson & animated storyboards</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  jobProgress.progress >= 80 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {jobProgress.progress >= 80 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>Building lecture-grounded mastery quiz</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  jobProgress.progress >= 95 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {jobProgress.progress >= 95 ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
                <span>Assembling 8 interactive educational games</span>
              </div>
            </div>

            <div className="flex items-center justify-between w-full text-xs text-slate-500 pt-2">
              <span>Job ID: <code className="text-slate-400">{jobProgress.jobId}</code></span>
              <button
                onClick={onClose}
                className="text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Process in background →
              </button>
            </div>
          </div>
        ) : (
          /* UPLOAD FORM */
          <div className="flex flex-col gap-6">
            {/* Drag & Drop Box */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-950/30'
                  : selectedFile
                  ? 'border-emerald-500 bg-emerald-950/20'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.md"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition ${
                  selectedFile
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-indigo-600/10 text-indigo-400'
                }`}
              >
                {selectedFile ? <FileText className="w-7 h-7" /> : <Upload className="w-7 h-7" />}
              </div>

              {selectedFile ? (
                <div>
                  <h5 className="text-base font-bold text-white">{selectedFile.name}</h5>
                  <p className="text-xs text-emerald-400 mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to analyze
                  </p>
                </div>
              ) : (
                <div>
                  <h5 className="text-sm sm:text-base font-semibold text-white">
                    Drag and drop your lecture PDF here, or <span className="text-indigo-400 underline">browse</span>
                  </h5>
                  <p className="text-xs text-slate-500 mt-1">Supports PDF, Markdown, and text (up to 35 MB)</p>
                </div>
              )}
            </div>

            {/* Optional Lecture Title */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Lecture Name / Course Code
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. Human Anatomy Lecture 3 or Econ 101: Market Equilibrium"
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            {/* Quick Test Preset University Lectures */}
            <div>
              <span className="block text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Or Test Instantly with Sample University Lectures:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    key: 'anatomy-circulatory-system',
                    title: 'Human Anatomy: Cardiac Mechanics',
                    subject: 'Medicine',
                    tag: 'Anatomy / Circulation',
                  },
                  {
                    key: 'economics-supply-demand',
                    title: 'Macroeconomics: Equilibrium',
                    subject: 'Economics',
                    tag: 'Supply & Demand',
                  },
                  {
                    key: 'physics-newton-dynamics',
                    title: "Physics: Newton's Laws",
                    subject: 'Physics',
                    tag: 'Forces & Dynamics',
                  },
                ].map((preset) => {
                  const isSelected = selectedPreset === preset.key;
                  return (
                    <button
                      key={preset.key}
                      onClick={() => handleSelectPreset(preset.key, preset.title)}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-950/50 shadow-md shadow-indigo-500/20'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase block mb-1">
                        {preset.subject}
                      </span>
                      <h6 className="text-xs font-bold text-white leading-tight mb-1">{preset.title}</h6>
                      <span className="text-[10px] text-slate-400">{preset.tag}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Submit */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={startProcessing}
                disabled={isSubmitting || (!selectedFile && !selectedPreset)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-40 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95"
              >
                <span>Create Learning Experience</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
