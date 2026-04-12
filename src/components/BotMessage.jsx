import React, { useState, useEffect } from 'react';
import './BotMessage.css';

export default function BotMessage({ text, status, thinking, onFeedback }) {
  const [rating, setRating] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const showThinking = !text && status && !thinking;
  const hasThinking = thinking && thinking.steps && thinking.steps.length > 0;
  const isThinking = thinking?.isThinking;
  const hasText = text && text.length > 0;

  // Animate steps while thinking
  useEffect(() => {
    if (!isThinking || !thinking?.steps) return;
    setExpanded(true);
    setVisibleSteps(1);
    let i = 1;
    const timer = setInterval(() => {
      if (i < thinking.steps.length) {
        setVisibleSteps(i + 1);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [isThinking, thinking?.steps]);

  // Collapse when thinking finishes
  useEffect(() => {
    if (!isThinking && hasThinking) {
      setVisibleSteps(thinking.steps.length);
      const t = setTimeout(() => setExpanded(false), 500);
      return () => clearTimeout(t);
    }
  }, [isThinking, hasThinking, thinking?.steps?.length]);

  const handleRate = (value) => {
    if (rating) return;
    setRating(value);
    onFeedback?.(value);
  };

  return (
    <div className="bot-row">
      <div className="bot-avatar">福</div>
      <div className="bot-bubble">
        {/* Thinking section */}
        {hasThinking && (
          <div className="bot-think">
            <div className="bot-think-header" onClick={() => !isThinking && setExpanded(!expanded)}>
              {isThinking ? (
                <>
                  <span className="bot-think-pulse" />
                  <span className="bot-think-label-active">阿福正在思考...</span>
                </>
              ) : (
                <>
                  <span className="bot-think-icon">🧠</span>
                  <span className="bot-think-label-done">已完成思考</span>
                  <span className="bot-think-chevron">{expanded ? '∧' : '∨'}</span>
                </>
              )}
            </div>
            {expanded && (
              <div className="bot-think-body">
                {thinking.steps.slice(0, visibleSteps).map((step, i) => (
                  <div key={i} className="bot-think-step">
                    <span className="bot-think-arrow">›</span>{step}
                  </div>
                ))}
                {thinking.core_content && (!isThinking || visibleSteps >= thinking.steps.length) && (
                  <div className="bot-think-core">
                    <div className="bot-think-core-label">思考内容</div>
                    <div className="bot-think-core-text">{thinking.core_content}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Divider between thinking and reply */}
        {hasThinking && hasText && <div className="bot-divider" />}

        {/* Reply text or thinking status */}
        {showThinking ? (
          <span className="bot-thinking-status">{status}</span>
        ) : hasText ? (
          <div className="bot-text">{text}</div>
        ) : null}

        {/* Feedback buttons */}
        {hasText && (
          <div className="bot-feedback">
            <button
              className={`bot-fb ${rating === 'up' ? 'active' : ''} ${rating && rating !== 'up' ? 'dim' : ''}`}
              onClick={() => handleRate('up')}
              disabled={!!rating}
            >👍</button>
            <button
              className={`bot-fb ${rating === 'down' ? 'active' : ''} ${rating && rating !== 'down' ? 'dim' : ''}`}
              onClick={() => handleRate('down')}
              disabled={!!rating}
            >👎</button>
          </div>
        )}
      </div>
    </div>
  );
}
