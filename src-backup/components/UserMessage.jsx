import React from 'react';
import './UserMessage.css';

export default function UserMessage({ text }) {
  return (
    <div className="msg-row-user">
      <div className="msg-bubble-user">{text}</div>
    </div>
  );
}
