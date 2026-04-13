import React, { useState } from 'react';
import InputBar from './InputBar';
import './LandingPage.css';

const SET_A = [
  '空腹血糖6.2算严重吗',
  '三个月胖了10斤怎么控制',
  '体检说轻度脂肪肝要怎么改善',
  '经常吃外卖对血糖有影响吗',
];

const SET_B = [
  '血压138/88需要吃药吗',
  '体检尿酸偏高需要注意什么',
  '下班很晚几乎不运动怎么开始',
  '最近总睡不好凌晨两三点才能入睡',
];

export default function LandingPage({ onStart }) {
  const [useSetB, setUseSetB] = useState(false);
  const questions = useSetB ? SET_B : SET_A;

  return (
    <div className="landing-page">
      <div className="landing-body">
        <div className="landing-hero">
          <div className="landing-avatar">福</div>
          <h1 className="landing-title">你好，我是阿福</h1>
          <p className="landing-subtitle">
            帮你看懂健康信息，找到能开始的第一步。<br />
            可以聊体检指标、饮食作息、近期身体困扰～
          </p>
        </div>

        <div className="landing-cards">
          {questions.map((q) => (
            <button key={q} className="landing-card" onClick={() => onStart(q)}>
              <span className="landing-card-icon">#</span>
              <span className="landing-card-text">{q}</span>
              <span className="landing-card-arrow">→</span>
            </button>
          ))}
        </div>

        <button className="landing-refresh" onClick={() => setUseSetB((v) => !v)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          换一换
        </button>
      </div>

      <InputBar onSend={onStart} />
    </div>
  );
}
