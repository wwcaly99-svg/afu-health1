import React from 'react';

export default function ProfileDetailDrawer({ visible, profile, hasSavedRecords, onClose }) {
  if (!visible) return null;

  // If no records have been saved yet, show empty state
  if (!hasSavedRecords) {
    return (
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-handle" />
          <div className="drawer-content">
            <div className="drawer-header">
              <h2 className="drawer-title">健康档案</h2>
              <button className="drawer-close" onClick={onClose}>✕</button>
            </div>
            <div className="profile-empty">
              <div className="profile-empty-icon">🔒</div>
              <div className="profile-empty-title">还没有保存的档案信息</div>
              <div className="profile-empty-desc">
                在对话中，阿福会识别可保存的健康信息。
                <br />你确认后才会加入档案，仅自己可见。
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" />
        <div className="drawer-content">
          <div className="drawer-header">
            <h2 className="drawer-title">健康档案</h2>
            <button className="drawer-close" onClick={onClose}>✕</button>
          </div>

          <div className="profile-privacy-badge">
            <span>🔒</span> 所有档案信息仅自己可见
          </div>

          {profile.theme && (
            <div className="profile-section">
              <div className="profile-theme">
                <span className="profile-theme-icon">🏥</span>
                <span>当前主题：{profile.theme}</span>
              </div>
            </div>
          )}

          {profile.indicators.length > 0 && (
            <div className="profile-section">
              <h3 className="drawer-section-title">已确认指标</h3>
              {profile.indicators.map((ind, i) => (
                <div key={i} className="profile-record-row">
                  <div className="profile-record-main">
                    <span className="profile-record-label">{ind.label}</span>
                    <span className="profile-record-value">{ind.value}</span>
                  </div>
                  <span className="profile-record-date">{ind.date}</span>
                </div>
              ))}
            </div>
          )}

          {profile.habits.length > 0 && (
            <div className="profile-section">
              <h3 className="drawer-section-title">已确认习惯 / 约束</h3>
              <div className="profile-tags">
                {profile.habits.map((h, i) => (
                  <span key={i} className="profile-tag">{h}</span>
                ))}
              </div>
            </div>
          )}

          {profile.goals.length > 0 && (
            <div className="profile-section">
              <h3 className="drawer-section-title">已确认目标</h3>
              {profile.goals.map((g, i) => (
                <div key={i} className="profile-goal">
                  <span className="profile-goal-icon">🎯</span>
                  <span>{g}</span>
                </div>
              ))}
            </div>
          )}

          {profile.recentRecords.length > 0 && (
            <div className="profile-section">
              <h3 className="drawer-section-title">最近保存</h3>
              {profile.recentRecords.map((r, i) => (
                <div key={i} className="profile-recent">
                  <span className="profile-recent-text">{r.text}</span>
                  <span className="profile-recent-time">{r.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
