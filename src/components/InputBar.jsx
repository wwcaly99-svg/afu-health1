import React, { useState } from 'react';
import './InputBar.css';

export default function InputBar({ onSend }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <div className="input-bar">
      <div className="input-bar-row">
        <div className="input-bar-field-wrap">
          <button className="input-bar-icon-btn" aria-label="语音">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M12 19v4m-4 0h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
          <input
            className="input-bar-field"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的健康问题…"
          />
          {hasText ? (
            <button className="input-bar-send-btn" onClick={handleSend}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
              </svg>
            </button>
          ) : (
            <>
              <button className="input-bar-icon-btn" aria-label="更多">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8"/>
                  <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="input-bar-icon-btn" aria-label="拍照">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.8"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
