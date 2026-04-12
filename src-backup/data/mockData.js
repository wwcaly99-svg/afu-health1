// Mock conversation data for demo
export const mockConversations = [
  {
    id: 1,
    user: '空腹血糖 6.2 算严重吗？',
    bot: {
      action_type: 'answer',
      reply_text:
        '不算严重，但已经偏高了。空腹血糖正常值一般在 3.9–6.1 mmol/L 之间，6.2 属于「空腹血糖受损」，还不到糖尿病诊断标准（≥7.0），但说明身体对血糖的调节能力已经开始下降。\n\n建议你先不用太紧张，但可以从饮食和生活习惯上开始留意。',
      card: { type: 'none' },
      profile_preview: null,
    },
  },
  {
    id: 2,
    user: '最近体检空腹血糖 6.2，我是不是要开始注意饮食了？',
    bot: {
      action_type: 'answer_plus',
      reply_text:
        '是的，建议现在就开始注意饮食。6.2 虽然还没到糖尿病的标准，但属于偏高的灰色地带，越早调整，逆转的可能性越大。\n\n可以先从减少含糖饮料、控制精制碳水的量、保持三餐规律这几个方面开始。',
      card: { type: 'none' },
      profile_preview: {
        records: ['空腹血糖 6.2'],
      },
    },
  },
  {
    id: 3,
    user: '我最近血糖有点高，我该先做什么？',
    bot: {
      action_type: 'guide',
      reply_text:
        '先从减少含糖饮料和精制主食开始。血糖偏高初期，最有效的方式不是一下子全改，而是找到一个最容易坚持的切入点。',
      card: {
        type: 'plan',
        title: '先从一个最容易开始的点做起',
        subtitle: '适合血糖刚偏高时的起步建议',
        items: ['含糖饮料先停 3 天', '主食量先减一点', '三餐尽量规律'],
        progress_text: '今日进度',
        primary_text: '查看详情',
        secondary_text: '今天打卡',
      },
      profile_preview: null,
    },
  },
  {
    id: 4,
    user: '那你给我一个 3 天能执行的控糖计划',
    bot: {
      action_type: 'plan',
      reply_text:
        '可以，先给你一个低门槛的 3 天控糖起步版。不需要买任何东西，也不需要大幅改变日常，先试试看能不能做到。',
      card: {
        type: 'plan',
        title: '3 天控糖起步计划',
        subtitle: '先稳住，再逐步细化',
        items: ['早餐不喝甜饮料', '午餐主食减一点', '晚饭后走 10 分钟'],
        progress_text: '今日进度',
        primary_text: '查看详情',
        secondary_text: '今天打卡',
      },
      profile_preview: null,
    },
  },
  {
    id: 5,
    user: '这个计划我下班太晚做不到',
    bot: {
      action_type: 'adjust',
      reply_text:
        '那先别硬按原计划做，我们改成下班晚也能完成的版本。核心是降低执行门槛，让你不用额外花精力也能做到。',
      card: {
        type: 'plan',
        title: '简化后的起步计划',
        subtitle: '适合下班晚、精力有限',
        items: ['晚饭只先改主食量', '不要求走路，只先停夜宵', '先做 2 天'],
        progress_text: '今日进度',
        primary_text: '查看详情',
        secondary_text: '今天打卡',
      },
      profile_preview: null,
    },
  },
  {
    id: 6,
    user: '我下班很晚，不想做复杂准备',
    bot: {
      action_type: 'answer_plus',
      reply_text:
        '明白，那后面给你的建议会尽量从低门槛的方式开始，不需要额外准备时间。你的节奏我记下了。',
      card: { type: 'none' },
      profile_preview: {
        records: ['下班较晚', '不想复杂准备'],
      },
    },
  },
];

// Pre-built plan detail data
export const defaultPlanDetail = {
  title: '3 天控糖起步计划',
  description:
    '这是一个低门槛的起步计划，帮你先建立基础习惯。不需要买任何东西，也不需要大幅改变日常。先试 3 天，看看感觉如何。',
  duration: '3 天',
  tasks: [
    { id: 't1', text: '早餐不喝甜饮料', checked: false },
    { id: 't2', text: '午餐主食减一点', checked: false },
    { id: 't3', text: '晚饭后走 10 分钟', checked: false },
  ],
};

// Pre-built profile data
export const defaultProfile = {
  theme: '血糖管理',
  indicators: [
    { label: '空腹血糖', value: '6.2 mmol/L', date: '2026-04-02' },
  ],
  habits: ['下班较晚', '不想复杂准备'],
  goals: ['控制血糖到正常范围', '养成规律饮食习惯'],
  recentRecords: [
    { text: '空腹血糖 6.2', time: '2 小时前' },
    { text: '下班较晚', time: '刚刚' },
    { text: '不想复杂准备', time: '刚刚' },
  ],
};

// Mock responses for user input
export const mockResponses = {
  default: {
    action_type: 'answer',
    reply_text:
      '我理解你的问题。关于健康管理，最重要的是循序渐进，不要给自己太大压力。如果你有具体的指标或者症状想聊，可以告诉我更多细节。',
    card: { type: 'none' },
    profile_preview: null,
  },
  血糖: {
    action_type: 'guide',
    reply_text:
      '血糖管理的关键是饮食和运动的配合。建议你先从日常饮食中最容易调整的部分开始。',
    card: {
      type: 'plan',
      title: '血糖管理入门计划',
      subtitle: '从最简单的调整开始',
      items: ['减少含糖饮料', '控制主食量', '餐后适量活动'],
      progress_text: '今日进度',
      primary_text: '查看详情',
      secondary_text: '今天打卡',
    },
    profile_preview: null,
  },
  计划: {
    action_type: 'plan',
    reply_text: '好的，我来帮你制定一个适合你情况的计划。',
    card: {
      type: 'plan',
      title: '个性化健康计划',
      subtitle: '根据你的情况定制',
      items: ['调整饮食结构', '增加轻度运动', '规律作息'],
      progress_text: '今日进度',
      primary_text: '查看详情',
      secondary_text: '今天打卡',
    },
    profile_preview: null,
  },
};
