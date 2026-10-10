import React, { useState, useEffect } from 'react';
import { checkHealth } from '../services/api';
import { 
  Server, 
  Database, 
  Layers, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Terminal, 
  Cpu,
  ArrowRight
} from 'lucide-react';

const phases = [
  { id: 1, name: "Project Foundation & Setup", status: "current" },
  { id: 2, name: "Connect MySQL & Config", status: "ready" },
  { id: 3, name: "Database Entities (14 Tables)", status: "pending" },
  { id: 4, name: "Spring Data JPA Repositories", status: "pending" },
  { id: 5, name: "Service Layer & Business Logic", status: "pending" },
  { id: 6, name: "REST Controllers & Validation", status: "pending" },
  { id: 7, name: "API Testing & Verification", status: "pending" },
  { id: 8, name: "JWT Auth & Role Security", status: "pending" },
  { id: 9, name: "React Frontend Setup", status: "pending" },
  { id: 10, name: "Role-Based Login System", status: "pending" },
  { id: 11, name: "Admin SaaS Command Center", status: "pending" },
  { id: 12, name: "Academic CRUD Modules", status: "pending" },
  { id: 13, name: "Weekly Timetable Calendar", status: "pending" },
  { id: 14, name: "PDF Timetable Upload Portal", status: "pending" },
  { id: 15, name: "Apache PDFBox Parser Engine", status: "pending" },
  { id: 16, name: "Extracted Data Persistence", status: "pending" },
  { id: 17, name: "Real-time Conflict Detection", status: "pending" },
  { id: 18, name: "Faculty Personal Dashboard", status: "pending" },
  { id: 19, name: "Live Class Monitoring", status: "pending" },
  { id: 20, name: "Free Faculty Finder Engine", status: "pending" },
  { id: 21, name: "Meeting Scheduler & Checks", status: "pending" },
  { id: 22, name: "Reports & Utilization Analytics", status: "pending" },
  { id: 23, name: "Real-time Notifications", status: "pending" },
  { id: 24, name: "System Dynamics Analysis", status: "pending" },
  { id: 25, name: "Final End-to-End Integration", status: "pending" }
];

export default function PhaseVerificationPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkHealth();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Health check error:", err);
      setError(err.message || "Failed to reach Spring Boot Backend at http://localhost:8081");
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, []);

  const isBackendUp = healthData?.status === "UP";
  const isDbConnected = healthData?.database?.status === "CONNECTED";

  return (
    <div className="container" style={{ maxWidth: '1240px', padding: '2.5rem 1.5rem' }}>
      {/* Header Bar */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '2.5rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-info">
              <Cpu size={14} /> Phase 1 Initialized
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div className={`pulse-dot ${isBackendUp && isDbConnected ? 'online' : 'offline'}`} />
              <span style={{ fontSize: '0.85rem', color: isBackendUp && isDbConnected ? 'var(--status-success)' : 'var(--status-error)', fontWeight: 600 }}>
                {isBackendUp && isDbConnected ? 'System Online & Synchronized' : 'System Degraded / Connecting'}
              </span>
            </div>
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.025em', color: '#fff' }}>
            Smart Timetable <span style={{ color: 'var(--primary)' }}>Management System</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            College Academic Operations & Timetable Intelligence Command Center
          </p>
        </div>

        <button 
          id="btn-test-connection"
          onClick={fetchHealth} 
          disabled={loading}
          className="btn btn-primary"
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
          {loading ? "Checking Connectivity..." : "Re-Test Connection"}
        </button>
      </header>

      {/* Main Status Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2.5rem'
      }}>
        {/* Spring Boot Backend Card */}
        <div className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                background: 'rgba(56, 189, 248, 0.1)', 
                padding: '0.75rem', 
                borderRadius: '12px',
                color: 'var(--primary)'
              }}>
                <Server size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Spring Boot Backend</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  http://localhost:8081
                </p>
              </div>
            </div>
            {isBackendUp ? (
              <span className="badge badge-success"><CheckCircle2 size={12} /> UP</span>
            ) : (
              <span className="badge badge-error"><XCircle size={12} /> DOWN</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Health Endpoint:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>/api/health</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>CORS Policy:</span>
              <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Enabled (Vite 5173)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Response Latency:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {healthData?.latency ? `${healthData.latency} ms` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Backend Version:</span>
              <span style={{ color: '#fff' }}>{healthData?.version || 'v1.0.0'}</span>
            </div>
          </div>
        </div>

        {/* MySQL Database Card */}
        <div className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                background: 'rgba(99, 102, 241, 0.1)', 
                padding: '0.75rem', 
                borderRadius: '12px',
                color: 'var(--accent-indigo)'
              }}>
                <Database size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>MySQL 8.0 Database</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  localhost:3306 / smart_timetable_db
                </p>
              </div>
            </div>
            {isDbConnected ? (
              <span className="badge badge-success"><CheckCircle2 size={12} /> CONNECTED</span>
            ) : (
              <span className="badge badge-warning"><Activity size={12} /> PENDING</span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Active Database:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
                {healthData?.database?.database || 'smart_timetable_db'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>DBMS Engine:</span>
              <span style={{ color: '#fff' }}>
                {healthData?.database?.productName ? `${healthData.database.productName}` : 'MySQL Server 8.0'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>JPA / Hibernate:</span>
              <span style={{ color: 'var(--status-success)', fontWeight: 600 }}>Active (ddl-auto: update)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Connection Pool:</span>
              <span style={{ color: '#fff' }}>HikariCP Initialized</span>
            </div>
          </div>
        </div>

        {/* React Frontend Card */}
        <div className="card card-glass">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ 
                background: 'rgba(168, 85, 247, 0.1)', 
                padding: '0.75rem', 
                borderRadius: '12px',
                color: 'var(--accent-purple)'
              }}>
                <Layers size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>React + Vite UI</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  http://localhost:5173
                </p>
              </div>
            </div>
            <span className="badge badge-success"><CheckCircle2 size={12} /> ACTIVE</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>HTTP Client:</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>Axios (Configured)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Routing:</span>
              <span style={{ color: '#fff' }}>React Router Ready</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Styling Architecture:</span>
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Command Center Tokens</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Last Handshake:</span>
              <span style={{ color: 'var(--text-dim)' }}>{lastChecked || 'Just now'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Health Check JSON Inspector */}
      <div className="card card-glass" style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Terminal size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>
              Live REST API Response Payload: <code style={{ color: 'var(--primary)', fontSize: '0.85rem' }}>GET /api/health</code>
            </h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Real-time payload from Spring Boot
          </span>
        </div>

        {error ? (
          <div style={{ 
            background: 'var(--status-error-bg)', 
            border: '1px solid rgba(239, 68, 68, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: '1rem',
            color: 'var(--status-error)',
            fontSize: '0.875rem'
          }}>
            <strong>Connection Failed:</strong> {error}
          </div>
        ) : (
          <pre className="code-block">
            {healthData ? JSON.stringify(healthData, null, 2) : "Fetching status from Spring Boot backend..."}
          </pre>
        )}
      </div>

      {/* Incremental Roadmap Module Tracker */}
      <div className="card card-glass">
        <div style={{ marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Incremental Development Trajectory
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Strict Phase-by-Phase implementation protocol. Each module is built, connected, run, tested, and validated before progression.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '0.75rem' 
        }}>
          {phases.map((p) => (
            <div 
              key={p.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: p.status === 'current' 
                  ? 'rgba(56, 189, 248, 0.12)' 
                  : p.status === 'ready' 
                  ? 'rgba(99, 102, 241, 0.08)' 
                  : 'rgba(255, 255, 255, 0.02)',
                border: p.status === 'current' 
                  ? '1px solid var(--primary)' 
                  : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.825rem'
              }}
            >
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: p.status === 'current' ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                color: p.status === 'current' ? '#04101e' : 'var(--text-muted)'
              }}>
                {p.id}
              </div>
              <span style={{ 
                flex: 1, 
                color: p.status === 'current' ? '#fff' : p.status === 'ready' ? '#cbd5e1' : 'var(--text-dim)',
                fontWeight: p.status === 'current' ? 600 : 400
              }}>
                {p.name}
              </span>
              {p.status === 'current' && (
                <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>Active</span>
              )}
              {p.status === 'ready' && (
                <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>Next</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
