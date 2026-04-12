import React from 'react';
import './InlinePlanCard.css';

export default function InlinePlanCard({ card, currentPlan, onOpenPlan }) {
  // Derive progress from currentPlan if it matches
  let progressText = '';
  let progressPercent = 0;
  let total = card.items_preview?.length || 0;
  let done = 0;

  if (currentPlan && currentPlan.title === card.title && Array.isArray(currentPlan.tasks)) {
    total = currentPlan.tasks.length;
    done = currentPlan.tasks.filter((t) => t.completed || t.checked).length;
    progressText = `已完成 ${done}/${total}`;
    progressPercent = total > 0 ? (done / total) * 100 : 0;
  } else if (total > 0) {
    progressText = `今日进度 0/${total}`;
  }

  return (
    <div className="inline-plan-card-row">
      <div className="inline-plan-card-avatar-spacer" />
      <div className="inline-plan-card" onClick={onOpenPlan}>
        <div className="inline-plan-card-header">
          <div className="inline-plan-card-icon">📋</div>
          <div>
            <div className="inline-plan-card-title">{card.title}</div>
            {card.period_text && (
              <div className="inline-plan-card-period">{card.period_text}</div>
            )}
          </div>
        </div>

        {progressText && (
          <div className="inline-plan-card-progress-area">
            <div className="inline-plan-card-progress-text">{progressText}</div>
            <div className="inline-plan-card-progress-bar">
              <div
                className="inline-plan-card-progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        <div className="inline-plan-card-actions" onClick={(e) => e.stopPropagation()}>
          <button className="inline-plan-card-btn-primary" onClick={onOpenPlan}>
            {card.primary_action || '查看详情'}
          </button>
        </div>
      </div>
    </div>
  );
}
