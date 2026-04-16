import { Menu, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUser } from '@/store/slices/authSlice';
import { getInitials, getAvatarColor } from '@/lib/utils';
import { useLocation } from 'react-router-dom';

const titles = {
  '/': 'Dashboard',
  '/employees': 'Employees',
  '/departments': 'Departments',
  '/leaves': 'Leave Requests',
  '/profile': 'My Profile',
};

export default function Header({ onMenuClick }) {
  const user = useSelector(selectUser);
  const location = useLocation();
  const title = titles[location.pathname] || 'HR-CRM';

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-400 hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <p className="text-xs text-slate-500 hidden sm:block">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white ${getAvatarColor(user?.name)}`}>
          {getInitials(user?.name)}
        </div>
      </div>
    </header>
  );
}
