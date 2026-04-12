import React from 'react';
import './Header.css';

export default function Header({ onOpenPlan, onOpenProfile }) {
  return (
    <header className="header">
      <div className="header-row">
        <div className="header-brand">
          <span className="header-title">阿福</span>
          <span className="header-subtitle">健康助手 ✨</span>
        </div>
        <div className="header-actions">
          <button className="header-entry-btn" onClick={onOpenPlan}>
            🏃 行动
          </button>
          <button className="header-entry-btn" onClick={onOpenProfile}>
            📋 档案
          </button>
        </div>
      </div>
    </header>
  );
}
