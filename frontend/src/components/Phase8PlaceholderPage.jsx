import React from 'react';
import { Layers, Sparkles, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Phase8PlaceholderPage({ moduleName, description, icon: Icon = Layers }) {
  return (
    <div className="page-wrapper">
      <div className="placeholder-container">
        <div className="placeholder-card">
          <div className="placeholder-icon-wrap">
            <Icon size={40} className="text-cyan" />
          </div>
          <span className="placeholder-badge">
            <Sparkles size={14} /> Next Phase Ready
          </span>
          <h2 className="placeholder-title">{moduleName}</h2>
          <p className="placeholder-text">
            {description || 'This module will be fully populated in the upcoming phase.'}
          </p>
          <div className="placeholder-status-box">
            <Clock size={16} className="text-cyan" />
            <span>Module coming in the next implementation phase.</span>
          </div>
          <p className="placeholder-subtext">
            All corresponding backend JPA entities, Spring Data repositories, transactional services, and REST APIs are already compiled and active in the Spring Boot backend.
          </p>
          <Link to="/admin/dashboard" className="btn-secondary-link">
            <span>Return to Command Center</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
