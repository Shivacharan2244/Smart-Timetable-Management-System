import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  CalendarDays,
  Radio,
  UserCheck,
  Video,
  Upload,
  History,
  Users,
  BookOpen,
  DoorOpen,
  Layers,
  Clock,
  FileBarChart2,
  Cpu,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  Shield,
  CheckCircle2
} from 'lucide-react';

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/timetable', icon: CalendarDays, label: 'Timetable' },
    { to: '/admin/live-classes', icon: Radio, label: 'Live Classes' },
    { to: '/admin/free-faculty', icon: UserCheck, label: 'Free Faculty' },
    { to: '/admin/meetings', icon: Video, label: 'Meetings' },
    { to: '/admin/upload', icon: Upload, label: 'Upload Timetable' },
    { to: '/admin/upload-history', icon: History, label: 'Upload History' },
    { to: '/admin/faculty', icon: Users, label: 'Faculty' },
    { to: '/admin/subjects', icon: BookOpen, label: 'Subjects' },
    { to: '/admin/rooms', icon: DoorOpen, label: 'Rooms' },
    { to: '/admin/sections', icon: Layers, label: 'Sections' },
    { to: '/admin/time-slots', icon: Clock, label: 'Time Slots' },
    { to: '/admin/reports', icon: FileBarChart2, label: 'Reports' },
    { to: '/admin/analysis', icon: Cpu, label: 'System Analysis' },
    { to: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { to: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="layout-root">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main Sidebar */}
      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-show' : ''}`}>
        <div className="sidebar-header">
          <div className="brand-flex">
            <div className="brand-logo-icon-wrap">
              <Shield size={20} className="text-cyan" />
            </div>
            {!isCollapsed && (
              <div className="brand-text-col">
                <span className="brand-title">Smart Timetable</span>
                <span className="brand-badge-admin">Admin Operations</span>
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
              <span className="status-text">Operations Center Live</span>
            </div>
          </div>

          <div className="navbar-right">
            <NavLink
              to="/admin/notifications"
              className="top-navbar-btn"
              title="Campus Notifications"
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
              <div className="avatar-circle">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="user-info-col">
                <span className="user-name">{currentUser?.name || 'Administrator'}</span>
                <span className="user-role-tag">{currentUser?.role || 'ADMIN'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="content-container">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
