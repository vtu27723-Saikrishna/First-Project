import React, { useState } from 'react';
import { TriageReport } from '../types';
import { 
  UserCheck, 
  CheckCircle2, 
  X, 
  Wrench, 
  FileText, 
  Truck, 
  Calendar,
  AlertCircle
} from 'lucide-react';

interface SupervisorReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TriageReport;
  onApprove: (notes: string, supervisorName: string) => Promise<void>;
}

export const SupervisorReviewModal: React.FC<SupervisorReviewModalProps> = ({
  isOpen,
  onClose,
  report,
  onApprove
}) => {
  const [supervisorName, setSupervisorName] = useState('S. Sundaram (Sr. Plant Engineer)');
  const [approvalNotes, setApprovalNotes] = useState(
    `Approved for execution. Mobilizing hydraulic torque tool team and requisitioning SKF 23024 bearing kit from Muppandal stores.`
  );
  const [workOrderNo, setWorkOrderNo] = useState(`WO-2026-MP${report.turbineCode.replace(/[^0-9]/g, '') || '04'}`);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullNotes = `Work Order ${workOrderNo} Dispatched by ${supervisorName}. Notes: ${approvalNotes}`;
      await onApprove(fullNotes, supervisorName);
      onClose();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Supervisor CBM Sign-Off</h3>
              <p className="text-xs text-slate-400">
                Authorize intervention for <strong className="text-emerald-300 font-mono">{report.turbineCode}</strong> ({report.priority})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Summary Box */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-rose-400">Severity Score: {report.severityScore}/100</span>
              <span className="font-mono text-slate-400">Technician: {report.technicianName}</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-semibold">
              "{report.recommendedAction}"
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Supervisor Name & Designation:</label>
            <input
              type="text"
              value={supervisorName}
              onChange={(e) => setSupervisorName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Dispatch Work Order Number:</label>
            <input
              type="text"
              value={workOrderNo}
              onChange={(e) => setWorkOrderNo(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-300 font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Supervisor Authorization Notes & Logistics:</label>
            <textarea
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Signing...' : 'Approve & Dispatch Work Order'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
