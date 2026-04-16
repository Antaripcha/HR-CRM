import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { fetchLeaves, applyLeave, reviewLeave, cancelLeave, fetchLeaveStats, selectLeaves } from '@/store/slices/leaveSlice';
import { selectUser } from '@/store/slices/authSlice';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import { StatusBadge, LeaveBadge } from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import StatCard from '@/components/common/StatCard';
import { formatDate, capitalise } from '@/lib/utils';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

const LEAVE_TYPES = ['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid', 'other'].map(t => ({ value: t, label: capitalise(t) }));

const INITIAL_FORM = { type: 'annual', startDate: '', endDate: '', reason: '' };

export default function Leaves() {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const { list, stats, pagination, loading } = useSelector(selectLeaves);
  const isHrOrAdmin = ['admin', 'hr'].includes(user?.role);

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [applyOpen, setApplyOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [reviewNote, setReviewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = (p = 1, s = statusFilter) => dispatch(fetchLeaves({ page: p, limit: 10, status: s }));

  useEffect(() => { load(); dispatch(fetchLeaveStats()); }, []);

  const handlePageChange = (p) => { setPage(p); load(p); };
  const handleStatusFilter = (e) => { setStatusFilter(e.target.value); setPage(1); load(1, e.target.value); };

  const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validateForm = () => {
    const errs = {};
    if (!form.type) errs.type = 'Type is required';
    if (!form.startDate) errs.startDate = 'Start date required';
    if (!form.endDate) errs.endDate = 'End date required';
    if (form.startDate && form.endDate && form.endDate < form.startDate) errs.endDate = 'End must be after start';
    if (!form.reason || form.reason.length < 10) errs.reason = 'Reason must be at least 10 characters';
    return errs;
  };

  const handleApply = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) return setFormErrors(errs);
    setSubmitting(true);
    await dispatch(applyLeave(form));
    setSubmitting(false);
    setApplyOpen(false);
    setForm(INITIAL_FORM);
    load();
    dispatch(fetchLeaveStats());
  };

  const handleReview = async (action) => {
    await dispatch(reviewLeave({ id: reviewTarget._id, action, note: reviewNote }));
    setReviewTarget(null);
    setReviewNote('');
    dispatch(fetchLeaveStats());
  };

  const columns = [
    {
      key: 'employee', label: 'Employee',
      render: (leave) => isHrOrAdmin ? (
        <div className="flex items-center gap-2">
          <Avatar name={leave.employee?.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-white">{leave.employee?.name}</p>
            <p className="text-xs text-slate-500">{leave.employee?.email}</p>
          </div>
        </div>
      ) : <span className="text-slate-400 text-sm">You</span>,
    },
    { key: 'type', label: 'Type', render: (l) => <LeaveBadge type={l.type} /> },
    { key: 'dates', label: 'Duration', render: (l) => (
        <div>
          <p className="text-sm text-white">{formatDate(l.startDate)} → {formatDate(l.endDate)}</p>
          <p className="text-xs text-slate-500">{l.totalDays} day{l.totalDays !== 1 ? 's' : ''}</p>
        </div>
      )
    },
    { key: 'reason', label: 'Reason', render: (l) => (
        <p className="text-sm text-slate-400 max-w-xs truncate" title={l.reason}>{l.reason}</p>
      )
    },
    { key: 'status', label: 'Status', render: (l) => <StatusBadge status={l.status} /> },
    {
      key: 'actions', label: '',
      render: (leave) => (
        <div className="flex items-center gap-1">
          {isHrOrAdmin && leave.status === 'pending' && (
            <button onClick={() => { setReviewTarget(leave); setReviewNote(''); }}
              className="px-3 py-1 text-xs font-medium bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 rounded-lg transition-colors">
              Review
            </button>
          )}
          {!isHrOrAdmin && leave.status === 'pending' && (
            <button onClick={() => setCancelTarget(leave)}
              className="px-3 py-1 text-xs font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Leave Requests</h2>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total requests</p>
        </div>
        {!isHrOrAdmin && (
          <button onClick={() => { setApplyOpen(true); setForm(INITIAL_FORM); setFormErrors({}); }} className="btn-primary">
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Clock} label="Pending" value={stats.pending || 0} iconBg="bg-amber-500/20" iconColor="text-amber-400" />
        <StatCard icon={CheckCircle} label="Approved" value={stats.approved || 0} iconBg="bg-emerald-500/20" iconColor="text-emerald-400" />
        <StatCard icon={XCircle} label="Rejected" value={stats.rejected || 0} iconBg="bg-red-500/20" iconColor="text-red-400" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled || 0} iconBg="bg-slate-700/60" iconColor="text-slate-400" />
      </div>

      {/* Filter */}
      <div className="card p-4">
        <select value={statusFilter} onChange={handleStatusFilter} className="input w-48">
          <option value="">All Statuses</option>
          {['pending', 'approved', 'rejected', 'cancelled'].map(s => (
            <option key={s} value={s}>{capitalise(s)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table columns={columns} data={list} loading={loading} emptyMessage="No leave requests found" />
        {pagination.total > 0 && (
          <div className="px-4 pb-4">
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={10} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      <Modal isOpen={applyOpen} onClose={() => setApplyOpen(false)} title="Apply for Leave" size="md">
        <form onSubmit={handleApply} className="space-y-4">
          <Select label="Leave Type *" name="type" value={form.type} onChange={handleFormChange} options={LEAVE_TYPES} error={formErrors.type} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date *" name="startDate" type="date" value={form.startDate} onChange={handleFormChange} error={formErrors.startDate} />
            <Input label="End Date *" name="endDate" type="date" value={form.endDate} onChange={handleFormChange} error={formErrors.endDate} />
          </div>
          <div>
            <label className="label">Reason *</label>
            <textarea name="reason" value={form.reason} onChange={handleFormChange} rows={3}
              placeholder="Explain the reason for your leave (min 10 chars)…"
              className={`input resize-none ${formErrors.reason ? 'border-red-500' : ''}`} />
            {formErrors.reason && <p className="mt-1 text-xs text-red-400">{formErrors.reason}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setApplyOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Submitting…' : 'Submit Application'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!reviewTarget} onClose={() => setReviewTarget(null)} title="Review Leave Request" size="md">
        {reviewTarget && (
          <div className="space-y-4">
            <div className="card p-4 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar name={reviewTarget.employee?.name} />
                <div>
                  <p className="font-semibold text-white">{reviewTarget.employee?.name}</p>
                  <p className="text-xs text-slate-500">{reviewTarget.employee?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm pt-1">
                <div><span className="text-slate-500">Type: </span><LeaveBadge type={reviewTarget.type} /></div>
                <div><span className="text-slate-500">Days: </span><span className="text-white">{reviewTarget.totalDays}</span></div>
                <div className="col-span-2"><span className="text-slate-500">Reason: </span><span className="text-slate-300">{reviewTarget.reason}</span></div>
              </div>
            </div>
            <div>
              <label className="label">Review Note (optional)</label>
              <textarea value={reviewNote} onChange={e => setReviewNote(e.target.value)} rows={2}
                placeholder="Add a note for the employee…" className="input resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setReviewTarget(null)} className="btn-secondary flex-1 justify-center">Cancel</button>
              <button onClick={() => handleReview('rejected')}
                className="flex-1 justify-center btn-danger">
                <XCircle className="w-4 h-4" /> Reject
              </button>
              <button onClick={() => handleReview('approved')}
                className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Approve
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancel confirm */}
      <ConfirmDialog
        isOpen={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={() => { dispatch(cancelLeave(cancelTarget._id)); setCancelTarget(null); dispatch(fetchLeaveStats()); }}
        title="Cancel Leave"
        message="Are you sure you want to cancel this leave request?"
        confirmLabel="Cancel Leave"
        danger
      />
    </div>
  );
}
