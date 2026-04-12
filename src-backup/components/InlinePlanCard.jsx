import React from 'react';
import './InlinePlanCard.css';

/**
 * InlinePlanCard — displays a plan summary card inline in the chat flow.
 *
 * Props:
 *   card        — PlanCard data (title, subtitle, progress_text, primary_text, secondary_text, items)
 *   currentPlan — the active Plan object (used to sync progress from task completion)
 *   onOpenPlan  — callback when user taps primary or secondary button
 */
export default function InlinePlanCard({ card, currentPlan, onOpenPlan }) {
  // Derive progress text: if currentPlan exists and matches this card, compute live progress
  let progressText = card.progress_text || '';
  if (currentPlan && currentPlan.title === card.title && Array.isArray(currentPlan.tasks)) {
    const total = currentPlan.tasks.length;
    const done = currentPlan.tasks.filter((t) => t.completed || t.checked).length;
    progressText = `已完成 ${done}/${total} 项`;
  }

  return (
    <div className="inline-plan-card-row">
      <div className="inline-plan-card-avatar-spacer" />
      <div className="inline-plan-card">
        <div className="inline-plan-card-header">
          <div className="inline-plan-card-icon">📋</div>
          <div>
            <div className="inline-plan-card-title">{card.title}</div>
            <div className="inline-plan-card-subtitle">{card.subtitle}</div>
          </div>
        </div>

        <div className="inline-plan-card-progress">{progressText}</div>

        <div className="inline-plan-card-actions">
          <button className="inline-plan-card-btn-primary" onClick={onOpenPlan}>
            {card.primary_text}
          </button>
          <button className="inline-plan-card-btn-secondary" onClick={onOpenPlan}>
            {card.secondary_text}
          </button>
        </div>
      </div>
    </div>
  );
}
