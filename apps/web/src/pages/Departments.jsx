import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Plus, Pencil, Trash2, Users, Building2 } from 'lucide-react';
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment, selectDepartments } from '@/store/slices/departmentSlice';
import Modal from '@/components/common/Modal';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Input from '@/components/common/Input';

const INITIAL_FORM = { name: '', description: '', budget: '' };

export default function Departments() {
  const dispatch = useDispatch();
  const { list, loading } = useSelector(selectDepartments);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { dispatch(fetchDepartments()); }, [dispatch]);

  const openCreate = () => { setEditTarget(null); setForm(INITIAL_FORM); setFormErrors({}); setModalOpen(true); };
  const openEdit = (dept) => {
    setEditTarget(dept);
    setForm({ name: dept.name, description: dept.description || '', budget: dept.budget || '' });
    setFormErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) return setFormErrors(errs);
    setSubmitting(true);
    const data = { ...form, budget: form.budget ? Number(form.budget) : undefined };
    if (editTarget) await dispatch(updateDepartment({ id: editTarget._id, data }));
    else await dispatch(createDepartment(data));
    setSubmitting(false);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Departments</h2>
          <p className="text-slate-500 text-sm mt-0.5">{list.length} departments</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-6 animate-pulse space-y-3">
              <div className="h-5 bg-slate-800 rounded w-1/2" />
              <div className="h-3 bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : list.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center gap-3">
          <Building2 className="w-12 h-12 text-slate-700" />
          <p className="text-slate-500">No departments yet</p>
          <button onClick={openCreate} className="btn-primary mt-2"><Plus className="w-4 h-4" /> Create first department</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((dept) => (
            <div key={dept._id} className="card p-6 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-400" />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => openEdit(dept)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(dept)}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-base font-bold text-white">{dept.name}</h3>
              <p className="text-xs font-mono text-slate-600 mt-0.5">{dept.code}</p>
              {dept.description && <p className="text-sm text-slate-400 mt-2 line-clamp-2">{dept.description}</p>}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800">
                <Users className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-400">{dept.employeeCount || 0} employees</span>
                {dept.head && (
                  <span className="ml-auto text-xs text-slate-500">Head: {dept.head.name}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Department' : 'New Department'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Department Name *" name="name" value={form.name} onChange={handleChange} placeholder="e.g. Engineering" error={formErrors.name} />
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Brief description of the department…" className="input resize-none" />
          </div>
          <Input label="Budget (₹)" name="budget" type="number" value={form.budget} onChange={handleChange} placeholder="e.g. 500000" />
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 justify-center">
              {submitting ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => { dispatch(deleteDepartment(deleteTarget._id)); setDeleteTarget(null); }}
        title="Delete Department"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone. All employees must be reassigned first.`}
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
