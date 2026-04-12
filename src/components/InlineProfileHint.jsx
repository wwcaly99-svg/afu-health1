import React, { useState } from 'react';
import './InlineProfileHint.css';

function enrichRecord(text) {
  if (/血糖\s*[\d.]+/.test(text) && !text.includes('mmol')) {
    return text.replace(/([\d.]+)/, '$1 mmol/L');
  }
  return text;
}

export default function InlineProfileHint({ records, status, onSave, onDismiss, onOpenProfile }) {
  const [fading, setFading] = useState(false);

  if (!records || records.length === 0) return null;
  if (status === 'dismissed' && !fading) return null;

  const enriched = records.map(enrichRecord);

  const handleDismiss = () => {
    setFading(true);
    setTimeout(() => {
      onDismiss();
    }, 300);
  };

  /* ── Saved ── */
  if (status === 'saved') {
    return (
      <div className="ph-row">
        <div className="ph-spacer" />
        <div className="ph-card ph-done" onClick={onOpenProfile}>
          <span className="ph-done-icon">✓</span>
          <span className="ph-done-text">已保存到健康档案</span>
          <span className="ph-done-sep">·</span>
          <span className="ph-done-sub">仅自己可见</span>
        </div>
      </div>
    );
  }

  /* ── Suggested ── */
  return (
    <div className={`ph-row ${fading ? 'ph-fade-out' : ''}`}>
      <div className="ph-spacer" />
      <div className="ph-card ph-ask">
        <div className="ph-ask-head">
          <span className="ph-ask-title">是否保存到健康档案</span>
        </div>

        <div className="ph-ask-items">
          {enriched.map((r, i) => (
            <div key={i} className="ph-ask-item">
              <span className="ph-ask-tag">{r}</span>
            </div>
          ))}
        </div>

        <div className="ph-ask-foot">
          <span className="ph-ask-hint">🔒 仅自己可见</span>
          <div className="ph-ask-btns">
            <button className="ph-btn-main" onClick={onSave}>保存到档案</button>
            <button className="ph-btn-ghost" onClick={handleDismiss}>先不保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
