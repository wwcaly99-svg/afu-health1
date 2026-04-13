import React from 'react';
import './InlinePlanCard.css';

export default function InlinePlanCard({ card, checkedItems, onOpenPlan }) {
  const total = card.items_preview?.length || 0;
  const done = checkedItems ? checkedItems.size : 0;
  const progressText = total > 0 ? `已完成 ${done}/${total}` : '';
  const progressPercent = total > 0 ? (done / total) * 100 : 0;

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
