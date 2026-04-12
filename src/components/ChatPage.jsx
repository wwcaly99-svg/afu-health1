import React, { useState, useRef, useEffect, useCallback } from 'react';
import Header from './Header';
import UserMessage from './UserMessage';
import BotMessage from './BotMessage';
import InlinePlanCard from './InlinePlanCard';
import InlineProfileHint from './InlineProfileHint';
import PlanDetailDrawer from './PlanDetailDrawer';
import ProfileDetailDrawer from './ProfileDetailDrawer';
import InputBar from './InputBar';
import { useChat } from '../hooks/useChat';
import {
  mockConversations,
  defaultPlanDetail,
  defaultProfile,
  mockResponses,
} from '../data/mockData';

let hintIdCounter = 0;

/**
 * Merge a plan_preview-derived plan with defaultPlanDetail mock.
 * Real fields win; missing fields fall back to mock defaults.
 */
function mergePlanWithMock(plan) {
  if (!plan) return defaultPlanDetail;

  const tasks = plan.tasks
    || plan.items_preview?.map((text, i) => ({ id: `t${i}`, text, checked: false }))
    || defaultPlanDetail.tasks;

  return {
    ...defaultPlanDetail,
    ...plan,
    description: plan.description || plan.period_text || defaultPlanDetail.description,
    duration: plan.duration || defaultPlanDetail.duration,
    tasks,
  };
}

/**
 * Merge saved records with defaultProfile mock.
 * Real saved data wins; missing sections fall back to mock defaults.
 */
function mergeProfileWithMock(savedRecords) {
  if (!savedRecords || savedRecords.length === 0) {
    return { profile: defaultProfile, hasSaved: false };
  }

  const savedTexts = savedRecords.map((r) => r.text);

  // Real saved records populate sections; mock fills gaps
  const indicators = savedTexts.some((t) => t.includes('血糖'))
    ? defaultProfile.indicators
    : [];

  const habits = savedTexts.filter((t) =>
    defaultProfile.habits.some((h) => t.includes(h))
  );

  return {
    profile: {
      ...defaultProfile,
      indicators: indicators.length > 0 ? indicators : defaultProfile.indicators,
      habits: habits.length > 0 ? habits : defaultProfile.habits,
      goals: defaultProfile.goals,
      recentRecords: savedRecords,
    },
    hasSaved: true,
  };
}

export default function ChatPage() {
  const { sendMessage: sendToApi, resetSession, getSessionId } = useChat();

  const handleNewChat = () => {
    setMessages([]);
    setHintStates({});
    setSavedRecords([]);
    setCurrentPlan(defaultPlanDetail);
    setCheckedMap({});
    sessionStorage.removeItem('afu-messages');
    sessionStorage.removeItem('afu-hintStates');
    sessionStorage.removeItem('afu-savedRecords');
    resetSession();
  };

  // Load messages from sessionStorage, or fall back to mock demo
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('afu-messages');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    const initial = [];
    mockConversations.slice(0, 3).forEach((conv) => {
      initial.push({ type: 'user', text: conv.user });
      initial.push({ type: 'bot', data: conv.bot, hintId: `hint-${hintIdCounter++}` });
    });
    return initial;
  });

  // Persist messages to sessionStorage on change
  useEffect(() => {
    try {
      sessionStorage.setItem('afu-messages', JSON.stringify(messages));
    } catch { /* ignore quota errors */ }
  }, [messages]);

  // Profile hint states: { [hintId]: 'suggested' | 'saved' | 'dismissed' }
  const [hintStates, setHintStates] = useState(() => {
    try {
      const saved = sessionStorage.getItem('afu-hintStates');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {};
  });

  // Saved records accumulated from user confirmations
  const [savedRecords, setSavedRecords] = useState(() => {
    try {
      const saved = sessionStorage.getItem('afu-savedRecords');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return [];
  });

  // Persist hint states and saved records
  useEffect(() => {
    try {
      sessionStorage.setItem('afu-hintStates', JSON.stringify(hintStates));
    } catch { /* ignore */ }
  }, [hintStates]);

  useEffect(() => {
    try {
      sessionStorage.setItem('afu-savedRecords', JSON.stringify(savedRecords));
    } catch { /* ignore */ }
  }, [savedRecords]);

  const getHintStatus = (hintId) => hintStates[hintId] || 'suggested';

  const handleSaveHint = (hintId, records) => {
    setHintStates((prev) => ({ ...prev, [hintId]: 'saved' }));
    setSavedRecords((prev) => [
      ...prev,
      ...records.map((r) => ({ text: r, time: '刚刚' })),
    ]);
  };

  const handleDismissHint = (hintId) => {
    setHintStates((prev) => ({ ...prev, [hintId]: 'dismissed' }));
  };

  // Track the latest plan from conversation
  const [currentPlan, setCurrentPlan] = useState(() => {
    const lastPlanConv = [...mockConversations.slice(0, 3)]
      .reverse()
      .find((c) => c.bot.card?.type === 'plan');
    if (lastPlanConv) {
      return {
        title: lastPlanConv.bot.card.title,
        description: lastPlanConv.bot.card.period_text,
        duration: '',
        items_preview: lastPlanConv.bot.card.items_preview,
        tasks: lastPlanConv.bot.card.items_preview.map((text, i) => ({
          id: `t${i}`,
          text,
          checked: false,
        })),
      };
    }
    return defaultPlanDetail;
  });

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
  const mockIndex = useRef(3);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openPlanDetail = (plan) => {
    setDrawerPlan(mergePlanWithMock(plan || currentPlan));
    setShowPlanDrawer(true);
  };

  const handleSend = async (text) => {
    setMessages((prev) => [...prev, { type: 'user', text }]);
    const newHintId = `hint-${hintIdCounter++}`;

    // Insert a streaming placeholder for the bot message
    const streamingMsgId = `stream-${Date.now()}`;
    const streamingMsg = {
      type: 'bot',
      data: { action_type: 'answer', reply_text: '', card: { type: 'none' }, profile_preview: { records: [] } },
      hintId: newHintId,
      _streamId: streamingMsgId,
    };
    setMessages((prev) => [...prev, streamingMsg]);

    // Try streaming API
    const apiResult = await sendToApi(text, {
      onThinking: (data) => {
        // Store thinking data on the streaming message
        setMessages((prev) =>
          prev.map((msg) =>
            msg._streamId === streamingMsgId
              ? { ...msg, _thinking: { steps: data.steps, core_content: data.core_content, isThinking: true } }
              : msg
          )
        );
      },
      onDelta: (deltaText, statusText) => {
        // Mark thinking as done when first delta arrives
        if (deltaText) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg._streamId === streamingMsgId && msg._thinking
                ? { ...msg, _thinking: { ...msg._thinking, isThinking: false } }
                : msg
            )
          );
        }
        if (statusText) {
          // Show thinking status
          setMessages((prev) =>
            prev.map((msg) =>
              msg._streamId === streamingMsgId
                ? { ...msg, data: { ...msg.data, reply_text: '' }, _status: statusText }
                : msg
            )
          );
        } else if (deltaText) {
          // Append delta text to the streaming message
          setMessages((prev) =>
            prev.map((msg) =>
              msg._streamId === streamingMsgId
                ? { ...msg, data: { ...msg.data, reply_text: msg.data.reply_text + deltaText }, _status: undefined }
                : msg
            )
          );
        }
      },
      onDone: (finalResult) => {
        if (!finalResult) return;
        // Replace streaming placeholder with final structured data
        const response = {
          action_type: finalResult.action_type,
          reply_text: finalResult.reply_text,
          card: finalResult.plan_preview
            ? { type: 'plan', ...finalResult.plan_preview }
            : { type: 'none' },
          profile_preview: finalResult.profile_hint
            ? { records: finalResult.profile_hint.records }
            : { records: [] },
        };
        setMessages((prev) =>
          prev.map((msg) =>
            msg._streamId === streamingMsgId
              ? { ...msg, data: response, _streamId: undefined, _thinking: msg._thinking ? { ...msg._thinking, isThinking: false } : undefined }
              : msg
          )
        );
        if (response.card?.type === 'plan') {
          setCurrentPlan({
            title: response.card.title,
            description: response.card.period_text,
            duration: '',
            items_preview: response.card.items_preview,
            tasks: response.card.items_preview.map((t, i) => ({
              id: `t${i}`,
              text: t,
              checked: false,
            })),
          });
        }
      },
      onError: () => {
        setThinkingData(null);
        // Remove the streaming placeholder, will fall through to mock below
        setMessages((prev) => prev.filter((msg) => msg._streamId !== streamingMsgId));
      },
    });

    if (apiResult) return;

    // Fallback to mock (streaming placeholder was removed by onError)
    setTimeout(() => {
      let response;
      if (mockIndex.current < mockConversations.length) {
        const mock = mockConversations[mockIndex.current];
        response = mock.bot;
        mockIndex.current++;
      } else {
        const key = Object.keys(mockResponses).find(
          (k) => k !== 'default' && text.includes(k)
        );
        response = key ? mockResponses[key] : mockResponses.default;
      }

      setMessages((prev) => [...prev, { type: 'bot', data: response, hintId: newHintId }]);

      if (response.card?.type === 'plan') {
        setCurrentPlan({
          title: response.card.title,
          description: response.card.period_text,
          duration: '',
          items_preview: response.card.items_preview,
          tasks: response.card.items_preview.map((t, i) => ({
            id: `t${i}`,
            text: t,
            checked: false,
          })),
        });
      }
    }, 600);
  };

  // Build dynamic profile: real saved data first, mock fills gaps
  const { profile: dynamicProfile, hasSaved } = mergeProfileWithMock(savedRecords);

  return (
    <div className="chat-page">
      <Header
        onOpenPlan={() => openPlanDetail(currentPlan)}
        onOpenProfile={() => setShowProfileDrawer(true)}
        onNewChat={handleNewChat}
      />

      <div className="chat-list">
        {messages.map((msg, i) => {
          if (msg.type === 'user') {
            return <UserMessage key={i} text={msg.text} />;
          }
          const { data, hintId } = msg;
          const records = data.profile_preview?.records;
          const hasRecords = records && records.length > 0;

          return (
            <React.Fragment key={i}>
              <BotMessage
                text={data.reply_text || ''}
                status={msg._status}
                thinking={msg._thinking}
                onFeedback={(rating) => {
                  fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      session_id: getSessionId(),
                      message_index: i,
                      action_type: data.action_type || 'unknown',
                      rating,
                    }),
                  }).catch(() => {});
                }}
              />
              {data.card?.type === 'plan' && (
                <InlinePlanCard
                  card={data.card}
                  currentPlan={currentPlan}
                  onOpenPlan={() =>
                    openPlanDetail({
                      title: data.card.title,
                      description: data.card.period_text,
                      duration: '',
                      items_preview: data.card.items_preview,
                      tasks: data.card.items_preview.map((t, idx) => ({
                        id: `t${idx}`,
                        text: t,
                      })),
                    })
                  }
                />
              )}
              {hasRecords && (
                <InlineProfileHint
                  records={records}
                  status={getHintStatus(hintId)}
                  onSave={() => handleSaveHint(hintId, records)}
                  onDismiss={() => handleDismissHint(hintId)}
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
        profile={dynamicProfile}
        hasSavedRecords={hasSaved}
        onClose={() => setShowProfileDrawer(false)}
      />
    </div>
  );
}
