import Sidebar from '../common/Sidebar';
import { Outlet } from 'react-router-dom';
import { Bell, User as UserIcon } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function DashboardLayout() {
  const { user } = useSelector(state => state.auth);
  
  return (
    <div className="min-h-screen flex bg-slate-50 font-sans">
      <Sidebar role={user?.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <h1 className="text-lg font-semibold text-navy capitalize">{user?.role} Dashboard</h1>
          <div className="flex items-center gap-5">
            <button className="relative p-2 text-gray-400 hover:text-electric transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-electric rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name?.charAt(0) || <UserIcon className="w-4 h-4"/>}
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
