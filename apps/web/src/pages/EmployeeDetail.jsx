import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Building2, Calendar, Briefcase, MapPin } from 'lucide-react';
import { employeeAPI } from '@/lib/api';
import Avatar from '@/components/common/Avatar';
import { StatusBadge, RoleBadge } from '@/components/common/Badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import PageLoader from '@/components/common/PageLoader';

export default function EmployeeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeAPI.getById(id)
      .then(res => setEmployee(res.data.data.employee))
      .catch(() => navigate('/employees'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <PageLoader />;
  if (!employee) return null;

  const { user, employeeId, phone, department, designation, joiningDate, salary, address, emergencyContact, status } = employee;

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm text-white font-medium mt-0.5">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <button onClick={() => navigate('/employees')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </button>

      {/* Profile header */}
      <div className="card p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Avatar name={user?.name} size="xl" />
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
              <StatusBadge status={status} />
              <RoleBadge role={user?.role} />
            </div>
            <p className="text-slate-400 mt-1">{designation || 'No designation'} · {department?.name || 'No department'}</p>
            <p className="text-slate-600 text-sm font-mono mt-1">{employeeId}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact info */}
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-3">Contact Information</h3>
          <InfoRow icon={Mail} label="Email" value={user?.email} />
          <InfoRow icon={Phone} label="Phone" value={phone} />
          <InfoRow icon={Building2} label="Department" value={department?.name} />
          <InfoRow icon={Briefcase} label="Designation" value={designation} />
          <InfoRow icon={Calendar} label="Joining Date" value={formatDate(joiningDate)} />
        </div>

        {/* Financial / address */}
        <div className="card p-6 space-y-4">
          <h3 className="text-base font-semibold text-white border-b border-slate-800 pb-3">Additional Details</h3>
          <InfoRow icon={Briefcase} label="Monthly Salary" value={salary ? formatCurrency(salary) : null} />
          {address?.city && (
            <InfoRow icon={MapPin} label="Address"
              value={[address.street, address.city, address.state, address.country].filter(Boolean).join(', ')} />
          )}
          {emergencyContact?.name && (
            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-500 mb-2">Emergency Contact</p>
              <p className="text-sm text-white font-medium">{emergencyContact.name}</p>
              <p className="text-xs text-slate-400">{emergencyContact.relation} · {emergencyContact.phone}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
