import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Radio,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  GraduationCap,
  Video
} from 'lucide-react';

export default function FacultyLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/faculty/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/faculty/timetable', icon: CalendarDays, label: 'My Timetable' },
    { to: '/faculty/live-classes', icon: Radio, label: 'Live Classes' },
    { to: '/faculty/meetings', icon: Video, label: 'Meetings' },
    { to: '/faculty/notifications', icon: Bell, label: 'Notifications' },
    { to: '/faculty/profile', icon: User, label: 'My Profile' },
  ];

  return (
    <div className="layout-root">
      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Faculty Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-flex">
            <div className="brand-logo-icon-wrap faculty-theme">
              <GraduationCap size={20} className="text-indigo" />
            </div>
            {!isCollapsed && (
              <div className="brand-text-col">
                <span className="brand-title">Smart Timetable</span>
                <span className="brand-badge-faculty">Faculty Portal</span>
              </div>
            )}
          </div>
          <button
            type="button"
            className="collapse-toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="nav-item">
                  <NavLink
                    to={item.to}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setMobileOpen(false)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="nav-icon" />
                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button type="button" className="nav-link logout-btn" onClick={handleLogout}>
            <LogOut size={18} className="nav-icon text-error" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-viewport">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="navbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <div className="system-status-indicator">
              <span className="status-ping"></span>
              <span className="status-text">Faculty Station Online</span>
            </div>
          </div>

          <div className="navbar-right">
            <NavLink
              to="/faculty/notifications"
              className="top-navbar-btn"
              title="Notifications"
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'var(--bg-glass-subtle)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                marginRight: '0.75rem'
              }}
            >
              <Bell size={18} />
            </NavLink>

            <div className="user-profile-badge">
              <div className="avatar-circle faculty-avatar">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'F'}
              </div>
              <div className="user-info-col">
                <span className="user-name">{currentUser?.name || 'Faculty Member'}</span>
                <span className="user-role-tag faculty-tag">{currentUser?.role || 'FACULTY'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
