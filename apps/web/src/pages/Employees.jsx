import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Pencil, Trash2, Eye } from 'lucide-react';
import { fetchEmployees, createEmployee, updateEmployee, deleteEmployee, selectEmployees } from '@/store/slices/employeeSlice';
import { fetchDepartments, selectDepartments } from '@/store/slices/departmentSlice';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Pagination from '@/components/common/Pagination';
import Avatar from '@/components/common/Avatar';
import { StatusBadge, RoleBadge } from '@/components/common/Badge';
import { formatDate, debounce } from '@/lib/utils';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

const INITIAL_FORM = { name: '', email: '', phone: '', department: '', designation: '', joiningDate: '', role: 'employee' };

export default function Employees() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list, pagination, loading } = useSelector(selectEmployees);
  const { list: departments } = useSelector(selectDepartments);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback((p = 1, s = search, d = deptFilter) => {
    dispatch(fetchEmployees({ page: p, limit: 10, search: s, department: d }));
  }, [dispatch, search, deptFilter]);

  useEffect(() => { load(); dispatch(fetchDepartments()); }, []);

  const debouncedSearch = useCallback(debounce((val) => { setPage(1); load(1, val, deptFilter); }, 400), [deptFilter]);

  const handleSearchChange = (e) => { setSearch(e.target.value); debouncedSearch(e.target.value); };
  const handleDeptChange = (e) => { setDeptFilter(e.target.value); setPage(1); load(1, search, e.target.value); };
  const handlePageChange = (p) => { setPage(p); load(p); };

  const openCreate = () => { setEditTarget(null); setForm(INITIAL_FORM); setFormErrors({}); setModalOpen(true); };
  const openEdit = (emp) => {
    setEditTarget(emp);
    setForm({
      name: emp.user?.name || '',
      email: emp.user?.email || '',
      phone: emp.phone || '',
      department: emp.department?._id || '',
      designation: emp.designation || '',
      joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
      role: emp.user?.role || 'employee',
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name is required (min 2 chars)';
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFormErrors(errs);
    setSubmitting(true);
    if (editTarget) {
      await dispatch(updateEmployee({ id: editTarget._id, data: form }));
    } else {
      await dispatch(createEmployee(form));
    }
    setSubmitting(false);
    setModalOpen(false);
    load();
  };

  const deptOptions = departments.map(d => ({ value: d._id, label: d.name }));

  const columns = [
    {
      key: 'employee', label: 'Employee',
      render: (emp) => (
        <div className="flex items-center gap-3">
          <Avatar name={emp.user?.name} size="sm" />
          <div>
            <p className="font-medium text-white text-sm">{emp.user?.name || '—'}</p>
            <p className="text-xs text-slate-500">{emp.user?.email}</p>
          </div>
        </div>
      ),
    },
    { key: 'employeeId', label: 'ID', render: (emp) => <span className="font-mono text-xs text-slate-400">{emp.employeeId}</span> },
    { key: 'department', label: 'Department', render: (emp) => emp.department?.name || <span className="text-slate-600">—</span> },
    { key: 'designation', label: 'Designation', render: (emp) => emp.designation || <span className="text-slate-600">—</span> },
    { key: 'joiningDate', label: 'Joined', render: (emp) => formatDate(emp.joiningDate) },
    { key: 'role', label: 'Role', render: (emp) => <RoleBadge role={emp.user?.role} /> },
    { key: 'status', label: 'Status', render: (emp) => <StatusBadge status={emp.status} /> },
    {
      key: 'actions', label: '',
      render: (emp) => (
        <div className="flex items-center gap-1">
          <button onClick={() => navigate(`/employees/${emp._id}`)}
            className="p-1.5 text-slate-400 hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => openEdit(emp)}
            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
            <Pencil className="w-4 h-4" />
          </button>
          <button onClick={() => setDeleteTarget(emp)}
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">All Employees</h2>
          <p className="text-slate-500 text-sm mt-0.5">{pagination.total} total employees</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={handleSearchChange} placeholder="Search employees…"
            className="input pl-10" />
        </div>
        <select value={deptFilter} onChange={handleDeptChange} className="input sm:w-52">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <Table columns={columns} data={list} loading={loading} emptyMessage="No employees found" />
        {pagination.total > 0 && (
          <div className="px-4 pb-4">
            <Pagination page={page} pages={pagination.pages} total={pagination.total} limit={10} onPageChange={handlePageChange} />
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name *" name="name" value={form.name} onChange={handleFormChange} placeholder="John Doe" error={formErrors.name} />
            <Input label="Email *" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="john@company.com" error={formErrors.email} disabled={!!editTarget} />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleFormChange} placeholder="+91 98765 43210" />
            <Select label="Department" name="department" value={form.department} onChange={handleFormChange} options={deptOptions} />
            <Input label="Designation" name="designation" value={form.designation} onChange={handleFormChange} placeholder="Software Engineer" />
            <Input label="Joining Date" name="joiningDate" type="date" value={form.joiningDate} onChange={handleFormChange} />
            <Select label="Role" name="role" value={form.role} onChange={handleFormChange}
              options={[{ value: 'employee', label: 'Employee' }, { value: 'hr', label: 'HR' }]} />
          </div>
          {!editTarget && (
            <p className="text-xs text-slate-500 bg-slate-800 px-3 py-2 rounded-lg">
              Default password: <span className="font-mono text-slate-300">Welcome@123</span>
            </p>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Employee'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { dispatch(deleteEmployee(deleteTarget._id)); setDeleteTarget(null); }}
        title="Deactivate Employee"
        message={`Are you sure you want to deactivate ${deleteTarget?.user?.name}? They will lose access to the system.`}
        confirmLabel="Deactivate"
        danger
      />
    </div>
  );
}
