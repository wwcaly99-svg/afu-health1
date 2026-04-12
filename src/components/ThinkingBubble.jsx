import React, { useState, useEffect } from 'react';
import './ThinkingBubble.css';

/**
 * ThinkingBubble — collapsible thinking process display.
 * Props:
 *   steps: string[]
 *   coreContent: string
 *   isThinking: boolean — true while still thinking, false when done
 */
export default function ThinkingBubble({ steps, coreContent, isThinking }) {
  const [expanded, setExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);

  // Animate steps appearing while thinking
  useEffect(() => {
    if (!isThinking || !steps || steps.length === 0) return;
    setVisibleCount(1);
    setExpanded(true);
    let i = 1;
    const timer = setInterval(() => {
      if (i < steps.length) {
        setVisibleCount(i + 1);
        i++;
      } else {
        clearInterval(timer);
      }
    }, 300);
    return () => clearInterval(timer);
  }, [isThinking, steps]);

  // When thinking finishes, collapse after a short delay
  useEffect(() => {
    if (!isThinking && steps && steps.length > 0) {
      setVisibleCount(steps.length);
      const timer = setTimeout(() => setExpanded(false), 600);
      return () => clearTimeout(timer);
    }
  }, [isThinking, steps]);

  if (!steps || steps.length === 0) return null;

  return (
    <div className="think-row">
      <div className="think-spacer" />
      <div className="think-card">
        <div className="think-header" onClick={() => !isThinking && setExpanded(!expanded)}>
          {isThinking ? (
            <>
              <span className="think-dot-pulse" />
              <span className="think-label">阿福正在思考...</span>
            </>
          ) : (
            <>
              <span className="think-icon">🧠</span>
              <span className="think-label-done">已完成思考</span>
              <span className="think-chevron">{expanded ? '∧' : '∨'}</span>
            </>
          )}
        </div>

        {expanded && (
          <div className="think-body">
            <div className="think-steps">
              {steps.slice(0, visibleCount).map((step, i) => (
                <div key={i} className="think-step">
                  <span className="think-step-arrow">›</span>
                  {step}
                </div>
              ))}
            </div>
            {coreContent && (!isThinking || visibleCount >= steps.length) && (
              <div className="think-core">
                <div className="think-core-label">思考内容</div>
                <div className="think-core-text">{coreContent}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
