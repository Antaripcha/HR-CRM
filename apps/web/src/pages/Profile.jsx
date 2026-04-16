import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setCredentials } from '@/store/slices/authSlice';
import { User, Lock, Save } from 'lucide-react';
import Avatar from '@/components/common/Avatar';
import { RoleBadge } from '@/components/common/Badge';
import Input from '@/components/common/Input';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name || profileForm.name.length < 2) return toast.error('Name must be at least 2 characters');
    setSavingProfile(true);
    try {
      const res = await api.patch('/users/profile', profileForm);
      const updatedUser = res.data.data.user;
      dispatch(setCredentials({ user: updatedUser, accessToken: localStorage.getItem('accessToken') }));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password required';
    if (!pwForm.newPassword || pwForm.newPassword.length < 6) errs.newPassword = 'Min 6 characters';
    if (pwForm.newPassword !== pwForm.confirm) errs.confirm = 'Passwords do not match';
    if (Object.keys(errs).length) return setPwErrors(errs);
    setPwErrors({});
    setSavingPw(true);
    try {
      await api.patch('/users/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="card p-8 flex items-center gap-6">
        <Avatar name={user?.name} size="xl" />
        <div>
          <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
          <p className="text-slate-400 text-sm mt-0.5">{user?.email}</p>
          <div className="mt-2">
            <RoleBadge role={user?.role} />
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 bg-primary-500/20 rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 text-primary-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Personal Information</h3>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <Input label="Full Name" value={profileForm.name}
            onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" />
          <div>
            <label className="label">Email Address</label>
            <input value={user?.email} disabled className="input opacity-50 cursor-not-allowed" />
            <p className="text-xs text-slate-600 mt-1">Email cannot be changed</p>
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            <Save className="w-4 h-4" />
            {savingProfile ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-800">
          <div className="w-9 h-9 bg-amber-500/20 rounded-xl flex items-center justify-center">
            <Lock className="w-4 h-4 text-amber-400" />
          </div>
          <h3 className="text-base font-semibold text-white">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <Input label="Current Password" type="password" value={pwForm.currentPassword}
            onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter current password" error={pwErrors.currentPassword} />
          <Input label="New Password" type="password" value={pwForm.newPassword}
            onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Min 6 characters" error={pwErrors.newPassword} />
          <Input label="Confirm New Password" type="password" value={pwForm.confirm}
            onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
            placeholder="Repeat new password" error={pwErrors.confirm} />
          <button type="submit" disabled={savingPw} className="btn-primary">
            <Lock className="w-4 h-4" />
            {savingPw ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
