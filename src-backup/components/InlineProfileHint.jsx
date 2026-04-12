import React from 'react';
import './InlineProfileHint.css';

/**
 * InlineProfileHint — lightweight hint strip shown in chat flow
 * when the system records health profile information.
 *
 * Props:
 *   records       — array of recorded info strings
 *   onOpenProfile — callback when user taps the hint area
 */
export default function InlineProfileHint({ records, onOpenProfile }) {
  if (!records || records.length === 0) return null;

  return (
    <div className="inline-profile-hint-row">
      <div className="inline-profile-hint-avatar-spacer" />
      <div className="inline-profile-hint" onClick={onOpenProfile}>
        {records.map((record, i) => (
          <div key={i} className="inline-profile-hint-item">
            <span className="inline-profile-hint-icon">📝</span>
            <span className="inline-profile-hint-text">已记录：{record}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
