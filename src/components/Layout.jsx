import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../context/AuthContext';

const MASTER_USERS_PATH = '/master/users';
const MASTER_RECURRING_PATH = '/master/recurring-config';

export const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMasterExpanded, setIsMasterExpanded] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const canSeeDashboard = user?.role === 'SUPER_ADMIN' || user?.role === 'ASSET';
  const canSeeMasterData = isSuperAdmin || user?.role === 'ASSET';
  const canSeeMasterUsers = isSuperAdmin;
  const canSeeMasterRecurring = isSuperAdmin || user?.role === 'ASSET';

  const isActive = (path) => location.pathname === path;
  const isMasterActive = location.pathname.startsWith('/master');

  useEffect(() => {
    if (isMasterActive) setIsMasterExpanded(true);
  }, [isMasterActive]);

  const handleMasterToggle = () => {
    setIsMasterExpanded((prev) => !prev);
  };

  const navLinkClass = (active) =>
    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors outline-none ${
      active ? 'bg-slate-700 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
    }`;

  const childLinkClass = (active) =>
    `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      active ? 'bg-slate-700/80 text-white' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
    }`;

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-64 flex-col border-r border-slate-700/50 bg-slate-800">
        <div className="flex h-14 items-center gap-2 border-b border-slate-700/50 px-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600">
            <Icon icon="mdi:ticket-confirmation-outline" className="text-lg text-white" aria-hidden />
          </div>
          <span className="text-base font-semibold text-white">Ticketing</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Menu utama">
          {canSeeDashboard && (
            <Link
              to="/dashboard"
              className={navLinkClass(isActive('/dashboard'))}
              tabIndex={0}
              aria-label="Dashboard"
            >
              <Icon icon="mdi:view-dashboard-outline" className="h-5 w-5 shrink-0" aria-hidden />
              Dashboard
            </Link>
          )}
          <Link
            to="/"
            className={navLinkClass(isActive('/'))}
            tabIndex={0}
            aria-label="Task Management"
          >
            <Icon icon="mdi:clipboard-list-outline" className="h-5 w-5 shrink-0" aria-hidden />
            Task Management
          </Link>
          {canSeeMasterData && (
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={handleMasterToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleMasterToggle();
                  }
                }}
                className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors outline-none ${
                  isMasterActive ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                tabIndex={0}
                aria-expanded={isMasterExpanded}
                aria-label="Master Data"
              >
                <span className="flex items-center gap-3">
                  <Icon icon="mdi:database-cog-outline" className="h-5 w-5 shrink-0" aria-hidden />
                  Master Data
                </span>
                <Icon
                  icon={isMasterExpanded ? 'mdi:chevron-down' : 'mdi:chevron-right'}
                  className="h-5 w-5 shrink-0 text-slate-400"
                  aria-hidden
                />
              </button>
              {isMasterExpanded && (
                <div className="ml-4 space-y-0.5 border-l border-slate-600 pl-2">
                  {canSeeMasterUsers && (
                    <Link
                      to={MASTER_USERS_PATH}
                      className={childLinkClass(isActive(MASTER_USERS_PATH))}
                      aria-label="Master Users"
                    >
                      <Icon icon="mdi:account-group-outline" className="h-4 w-4 shrink-0" aria-hidden />
                      Users
                    </Link>
                  )}
                  {canSeeMasterRecurring && (
                    <Link
                      to={MASTER_RECURRING_PATH}
                      className={childLinkClass(isActive(MASTER_RECURRING_PATH))}
                      aria-label="Master Recurring Task"
                    >
                      <Icon icon="mdi:calendar-refresh-outline" className="h-4 w-4 shrink-0" aria-hidden />
                      Recurring Task
                    </Link>
                  )}
                </div>
              )}
            </div>
          )}
        </nav>
      </aside>
      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
          <div className="h-4 w-4" />
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
              onClick={() => setIsUserMenuOpen((prev) => !prev)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsUserMenuOpen((prev) => !prev);
                }
              }}
              aria-haspopup="menu"
              aria-expanded={isUserMenuOpen}
              aria-label="Menu pengguna"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-sm font-medium text-white">
                {user?.name?.[0] ?? 'U'}
              </span>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium text-slate-800">{user?.name}</span>
                <span className="text-xs text-slate-500">{user?.role}</span>
              </div>
              <Icon icon="mdi:chevron-down" className="h-4 w-4 text-slate-500" aria-hidden />
            </button>
            {isUserMenuOpen && (
              <div
                className="absolute right-0 z-20 mt-2 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                role="menu"
                tabIndex={-1}
              >
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:bg-slate-50"
                  onClick={handleLogout}
                  aria-label="Logout"
                >
                  <Icon icon="mdi:logout" className="h-4 w-4" aria-hidden />
                  Logout
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};
