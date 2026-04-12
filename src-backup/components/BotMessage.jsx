import React from 'react';
import './BotMessage.css';

export default function BotMessage({ text }) {
  return (
    <div className="msg-row-bot">
      <div className="msg-avatar-bot">福</div>
      <div className="msg-bubble-bot">{text}</div>
    </div>
  );
}
