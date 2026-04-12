import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import UserMessage from './UserMessage';
import BotMessage from './BotMessage';
import InlinePlanCard from './InlinePlanCard';
import InlineProfileHint from './InlineProfileHint';
import PlanDetailDrawer from './PlanDetailDrawer';
import ProfileDetailDrawer from './ProfileDetailDrawer';
import InputBar from './InputBar';
import {
  mockConversations,
  defaultPlanDetail,
  defaultProfile,
  mockResponses,
} from '../data/mockData';

export default function ChatPage() {
  // Load first 3 conversations as initial demo
  const [messages, setMessages] = useState(() => {
    const initial = [];
    mockConversations.slice(0, 3).forEach((conv) => {
      initial.push({ type: 'user', text: conv.user });
      initial.push({ type: 'bot', data: conv.bot });
    });
    return initial;
  });

  // Track the latest plan from conversation
  const [currentPlan, setCurrentPlan] = useState(() => {
    const lastPlanConv = [...mockConversations.slice(0, 3)]
      .reverse()
      .find((c) => c.bot.card?.type === 'plan');
    if (lastPlanConv) {
      return {
        title: lastPlanConv.bot.card.title,
        subtitle: lastPlanConv.bot.card.subtitle,
        description: lastPlanConv.bot.card.subtitle,
        duration: '3 天',
        items: lastPlanConv.bot.card.items,
        tasks: lastPlanConv.bot.card.items.map((text, i) => ({
          id: `t${i}`,
          text,
          checked: false,
        })),
        progress_text: lastPlanConv.bot.card.progress_text,
        primary_text: lastPlanConv.bot.card.primary_text,
        secondary_text: lastPlanConv.bot.card.secondary_text,
      };
    }
    return defaultPlanDetail;
  });

  const [profile] = useState(defaultProfile);

  // Global checked state keyed by plan title
  const [checkedMap, setCheckedMap] = useState({});

  const getCheckedSet = useCallback(
    (planTitle) => checkedMap[planTitle] || new Set(),
    [checkedMap]
  );

  const toggleCheck = useCallback((planTitle, index) => {
    setCheckedMap((prev) => {
      const existing = new Set(prev[planTitle] || []);
      if (existing.has(index)) {
        existing.delete(index);
      } else {
        existing.add(index);
      }
      return { ...prev, [planTitle]: existing };
    });
  }, []);

  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [drawerPlan, setDrawerPlan] = useState(null);

  const chatEndRef = useRef(null);
  const mockIndex = useRef(3); // Next mock conversation to use

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openPlanDetail = (plan) => {
    const detail = plan || currentPlan;
    setDrawerPlan(detail);
    setShowPlanDrawer(true);
  };

  const handleSend = (text) => {
    setMessages((prev) => [...prev, { type: 'user', text }]);

    // Simulate typing delay
    setTimeout(() => {
      let response;

      // Check if we have remaining mock conversations
      if (mockIndex.current < mockConversations.length) {
        const mock = mockConversations[mockIndex.current];
        response = mock.bot;
        mockIndex.current++;
      } else {
        // Use keyword matching
        const key = Object.keys(mockResponses).find(
          (k) => k !== 'default' && text.includes(k)
        );
        response = key ? mockResponses[key] : mockResponses.default;
      }

      setMessages((prev) => [...prev, { type: 'bot', data: response }]);

      // Update current plan if response has a plan card
      if (response.card?.type === 'plan') {
        setCurrentPlan({
          title: response.card.title,
          subtitle: response.card.subtitle,
          description: response.card.subtitle,
          duration: '3 天',
          items: response.card.items,
          tasks: response.card.items.map((t, i) => ({
            id: `t${i}`,
            text: t,
            checked: false,
          })),
          progress_text: response.card.progress_text,
          primary_text: response.card.primary_text,
          secondary_text: response.card.secondary_text,
        });
      }
    }, 600);
  };

  const handleQuickCheck = (card) => {
    // Find first unchecked item and check it
    const checked = getCheckedSet(card.title);
    for (let i = 0; i < card.items.length; i++) {
      if (!checked.has(i)) {
        toggleCheck(card.title, i);
        break;
      }
    }
  };

  return (
    <div className="chat-page">
      <Header
        onOpenPlan={() => openPlanDetail(currentPlan)}
        onOpenProfile={() => setShowProfileDrawer(true)}
      />

      <div className="chat-list">
        {messages.map((msg, i) => {
          if (msg.type === 'user') {
            return <UserMessage key={i} text={msg.text} />;
          }
          const { data } = msg;
          return (
            <React.Fragment key={i}>
              <BotMessage text={data.reply_text} />
              {data.card?.type === 'plan' && (
                <InlinePlanCard
                  card={data.card}
                  currentPlan={currentPlan}
                  onOpenPlan={() =>
                    openPlanDetail({
                      title: data.card.title,
                      subtitle: data.card.subtitle,
                      description: data.card.subtitle,
                      duration: '3 天',
                      items: data.card.items,
                      tasks: data.card.items.map((t, idx) => ({
                        id: `t${idx}`,
                        text: t,
                      })),
                    })
                  }
                />
              )}
              {data.profile_preview?.records && (
                <InlineProfileHint
                  records={data.profile_preview.records}
                  onOpenProfile={() => setShowProfileDrawer(true)}
                />
              )}
            </React.Fragment>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <InputBar onSend={handleSend} />

      <PlanDetailDrawer
        visible={showPlanDrawer}
        plan={drawerPlan}
        checkedItems={drawerPlan ? getCheckedSet(drawerPlan.title) : new Set()}
        onToggleTask={(i) => drawerPlan && toggleCheck(drawerPlan.title, i)}
        onClose={() => setShowPlanDrawer(false)}
      />

      <ProfileDetailDrawer
        visible={showProfileDrawer}
        profile={profile}
        onClose={() => setShowProfileDrawer(false)}
      />
    </div>
  );
}
