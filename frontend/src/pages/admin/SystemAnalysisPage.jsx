import React from 'react';
import {
  Cpu,
  RefreshCw,
  GitMerge,
  ShieldCheck,
  TrendingUp,
  Brain,
  Sliders,
  Sparkles,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';

const ARCHETYPES = [
  {
    title: '1. Fixes That Fail',
    subtitle: 'Ad-hoc Class Relocations',
    description:
      'Moving an overlapping lecture to an empty room resolves the immediate complaint, but without unified scheduling logic, it triggers ripple conflicts for subsequent lab sessions later in the day.',
    leverage: 'Unified relational constraints preventing piecemeal, unsynchronized room reassignments.'
  },
  {
    title: '2. Limits to Growth',
    subtitle: 'Manual Scheduling Capacity Ceiling',
    description:
      'As university programs and specialized elective courses expand, the combinatorial possibilities for faculty and classroom matching grow exponentially, overwhelming human schedulers.',
    leverage: 'Algorithmic conflict prevention and automated Apache PDFBox schedule extraction.'
  },
  {
    title: '3. Shifting the Burden',
    subtitle: 'Relying on Faculty Self-Correction',
    description:
      'When administrators rely on faculty members to informally resolve clashing periods among themselves, the institutional system never fixes the core structural scheduling flaws.',
    leverage: 'Centralized database rules and pre-emptive conflict warnings at the point of scheduling.'
  },
  {
    title: '4. Success to the Successful',
    subtitle: 'Classroom & Prime Slot Resource Monopolies',
    description:
      'Senior faculty or dominant departments routinely monopolize morning prime slots (10:00–12:00) and premium multimedia halls, while other cohorts are pushed to unfavorable twilight slots.',
    leverage: 'Equitable workload and room utilization analytics with transparency across departments.'
  },
  {
    title: '5. Tragedy of the Commons',
    subtitle: 'Unrestricted Seminar & Lab Booking',
    description:
      'Without systemic coordination, individual coordinators block conference rooms and lecture halls speculatively for meetings that get cancelled last minute, denying capacity to scheduled courses.',
    leverage: 'Integrated Meeting Scheduler with timetable cross-verification and availability validation.'
  }
];

const FUTURE_AI = [
  {
    title: 'AI Timetable Optimization (CSP / Genetic Algorithms)',
    category: 'Future Roadmap',
    description: 'Constraint Satisfaction Problem (CSP) solvers using genetic evolutionary algorithms to generate conflict-free semester master timetables from raw curriculum requirements.'
  },
  {
    title: 'Faculty Workload Balancing & Burnout Prevention',
    category: 'Future Roadmap',
    description: 'Machine learning regression models analyzing historical grading, teaching, and research hours to recommend optimal distribution of teaching duties across semesters.'
  },
  {
    title: 'Smart Room Utilization & IoT Occupancy Prediction',
    category: 'Future Roadmap',
    description: 'Predictive neural networks forecasting actual classroom headcounts from enrollment trends and weather/holiday factors to dynamically assign appropriate hall sizes.'
  },
  {
    title: 'Autonomous Conflict Healing & Resolution Assistant',
    category: 'Future Roadmap',
    description: 'LLM-assisted recommendation agent that not only identifies conflicts, but proposes 3 optimal multi-faculty schedule swaps with minimal disruption.'
  }
];

export default function SystemAnalysisPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          System Dynamics & Clash Analysis
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Systems thinking analysis, reinforcing feedback loops, archetypes, and high-leverage automation design.
        </p>
      </div>

      {/* Part 17: Causal Loop Diagram */}
      <div className="card p-6 border-2 border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/30 via-white to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20">
        <div className="flex items-center justify-between border-b border-indigo-100 dark:border-indigo-900/40 pb-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" style={{ animationDuration: '8s' }} />
              The Academic Scheduling Vicious Cycle: Reinforcing Loop (R)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Identified dynamics of manual university timetable operations before systemic automation
            </p>
          </div>
          <span className="badge badge-danger text-xs font-bold uppercase tracking-wider">
            Reinforcing Loop (R)
          </span>
        </div>

        {/* Visual Causal Loop Nodes */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative py-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-sm text-center">
            <div className="text-xs font-mono font-bold text-slate-400 mb-1">NODE 1</div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white">Manual Timetable Work</h3>
            <p className="text-[11px] text-slate-500 mt-1">Spreadsheets, paper charts, disconnected emails</p>
          </div>

          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm text-center">
            <div className="text-xs font-mono font-bold text-amber-500 mb-1">NODE 2</div>
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">Timetable Errors</h3>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-300/70 mt-1">Typo in room numbers, missed curriculum rules</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 shadow-sm text-center">
            <div className="text-xs font-mono font-bold text-rose-500 mb-1">NODE 3</div>
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">Faculty & Room Clashes</h3>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-300/70 mt-1">Double-booked professors and occupied labs</p>
          </div>

          <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm text-center">
            <div className="text-xs font-mono font-bold text-purple-500 mb-1">NODE 4</div>
            <h3 className="text-sm font-bold text-purple-900 dark:text-purple-200">Manual Corrections</h3>
            <p className="text-[11px] text-purple-700/80 dark:text-purple-300/70 mt-1">Emergency phone calls, ad-hoc room swaps</p>
          </div>

          <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-sm text-center">
            <div className="text-xs font-mono font-bold text-indigo-500 mb-1">NODE 5</div>
            <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-200">More Manual Work</h3>
            <p className="text-[11px] text-indigo-700/80 dark:text-indigo-300/70 mt-1">Administrative fatigue and spiraling chaos ↺</p>
          </div>
        </div>

        {/* Leverage Point Callout */}
        <div className="mt-6 p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/30 flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 dark:text-emerald-200">
            <span className="font-bold text-sm block">Systemic Leverage Point: Automation + Conflict Detection</span>
            By inserting relational database constraints and pre-commit multi-conflict checks at the source (Apache PDFBox parsing & CRUD controllers), the loop is broken at Node 2. Errors are detected before entering the master schedule.
          </div>
        </div>
      </div>

      {/* Part 17: Five Systems Archetypes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <GitMerge className="w-5 h-5 text-indigo-600" />
          Five Institutional Systems Archetypes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ARCHETYPES.map((arch, idx) => (
            <div key={idx} className="card p-5 space-y-3 border-t-4 border-t-indigo-600">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Archetype {idx + 1}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {arch.title}
                </h3>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{arch.subtitle}</p>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {arch.description}
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                <strong className="text-indigo-600 dark:text-indigo-400 block mb-0.5">High-Leverage Remedy:</strong>
                <span className="text-slate-500">{arch.leverage}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Part 18: Future Intelligent Enhancements */}
      <div className="card p-6 border-2 border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/20 via-white to-indigo-50/20 dark:from-slate-900 dark:to-purple-950/20 space-y-4">
        <div className="flex items-center justify-between border-b border-purple-100 dark:border-purple-900/40 pb-3">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Future Intelligent Enhancements (Roadmap)
              </h2>
              <p className="text-xs text-slate-500">
                Distinct future artificial intelligence possibilities (Not claimed in current rule-based operational build)
              </p>
            </div>
          </div>
          <span className="badge badge-secondary text-xs">Research Roadmap</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FUTURE_AI.map((item, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/60 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="badge badge-primary text-[10px] font-mono">{item.category}</span>
                <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>

        <div className="p-3.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            <strong>Transparency Notice:</strong> Current version 1.0 of the Smart Timetable Management System employs verified, deterministic rule-based database algorithms for conflict checking and availability calculation. AI/ML optimizations listed above represent planned v2.0 integrations.
          </span>
        </div>
      </div>
    </div>
  );
}
