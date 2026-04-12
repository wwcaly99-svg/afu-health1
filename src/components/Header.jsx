import React from 'react';
import './Header.css';

export default function Header({ onOpenPlan, onOpenProfile, onNewChat }) {
  return (
    <header className="header">
      <div className="header-row">
        <div className="header-brand">
          <div className="header-logo">福</div>
          <span className="header-title">阿福</span>
          <span className="header-dot">·</span>
          <span className="header-subtitle">健康助手</span>
        </div>
        <div className="header-actions">
          <button className="header-entry-btn" onClick={onOpenPlan}>
            <span>🏃</span> 行动
          </button>
          <button className="header-entry-btn" onClick={onOpenProfile}>
            <span>📋</span> 档案
          </button>
          <button className="header-new-btn" onClick={onNewChat} title="新对话">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
