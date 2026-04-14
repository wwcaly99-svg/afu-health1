import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import ChatPage from './components/ChatPage';
import IntroPage from './pages/IntroPage';
import './App.css';

export default function App() {
  if (window.location.pathname === '/intro') {
    return <IntroPage />;
  }

  const [view, setView] = useState('landing');
  const [initialMessage, setInitialMessage] = useState(null);

  const handleStart = (text) => {
    setInitialMessage(text);
    setView('chat');
  };

  const handleNewChat = () => {
    setInitialMessage(null);
    setView('landing');
  };

  if (view === 'chat') {
    return <ChatPage initialMessage={initialMessage} onNewChat={handleNewChat} />;
  }

  return <LandingPage onStart={handleStart} />;
}
