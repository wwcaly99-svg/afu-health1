import React from 'react';

export default function PlanDetailDrawer({
  visible,
  hasActivePlan,
  plan,
  checkedItems,
  onToggleTask,
  onClose,
}) {
  if (!visible) return null;

  if (!hasActivePlan) {
    return (
      <div className="drawer-overlay" onClick={onClose}>
        <div className="drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-handle" />
          <div className="drawer-content">
            <div className="drawer-header">
              <h2 className="drawer-title">行动计划</h2>
              <button className="drawer-close" onClick={onClose}>✕</button>
            </div>
            <div className="profile-empty">
              <div className="profile-empty-icon">📋</div>
              <div className="profile-empty-title">还没有行动计划</div>
              <div className="profile-empty-desc">
                和阿福聊聊你的健康情况，<br />
                我来帮你制定一个能开始的计划
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const total = plan.tasks ? plan.tasks.length : plan.items_preview?.length || 0;
  const done = plan.tasks
    ? plan.tasks.filter((_, i) => checkedItems.has(i)).length
    : plan.items_preview?.filter((_, i) => checkedItems.has(i)).length || 0;
  const progress = total > 0 ? Math.round((done / total) * 100) : 0;

  const taskList = plan.tasks || plan.items_preview?.map((text, i) => ({ id: `t${i}`, text })) || [];

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-handle" />
        <div className="drawer-content">
          <div className="drawer-header">
            <h2 className="drawer-title">{plan.title}</h2>
            <button className="drawer-close" onClick={onClose}>✕</button>
          </div>
          {plan.description && (
            <p className="drawer-desc">{plan.description}</p>
          )}
          {plan.duration && (
            <div className="drawer-duration">
              <span>⏱</span> 周期：{plan.duration}
            </div>
          )}

          <div className="drawer-progress-section">
            <div className="drawer-progress-label">
              <span>当前进度</span>
              <span>{done}/{total} 已完成</span>
            </div>
            <div className="drawer-progress-bar">
              <div
                className="drawer-progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="drawer-tasks">
            <h3 className="drawer-section-title">今日任务</h3>
            {taskList.map((task, i) => {
              const text = typeof task === 'string' ? task : task.text;
              return (
                <label key={i} className="drawer-task">
                  <input
                    type="checkbox"
                    checked={checkedItems.has(i)}
                    onChange={() => onToggleTask(i)}
                  />
                  <span className={`drawer-task-box ${checkedItems.has(i) ? 'checked' : ''}`}>
                    {checkedItems.has(i) ? '✓' : ''}
                  </span>
                  <span className={`drawer-task-text ${checkedItems.has(i) ? 'done' : ''}`}>
                    {text}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="drawer-actions">
            <button className="drawer-btn-warn">😮‍💨 这个太难了</button>
            <button className="drawer-btn-adjust">🔄 调整计划</button>
          </div>
        </div>
      </div>
    </div>
  );
}
