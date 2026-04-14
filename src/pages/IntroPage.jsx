import React from 'react';
import './IntroPage.css';

export default function IntroPage() {
  const goHome = () => { window.location.href = '/'; };

  return (
    <div className="intro-page">

      {/* ===== Screen 1: Hero ===== */}
      <section className="intro-screen intro-hero">
        <div className="intro-hero-badge">PROJECT INTRO</div>
        <h1 className="intro-hero-title">阿福健康助手</h1>
        <p className="intro-hero-subtitle">
          从健康信息理解，到行动建议，到计划调整
        </p>
        <p className="intro-hero-tagline">基于 LLM 的个人健康管理 Agent Demo</p>
        <button className="intro-hero-cta" onClick={goHome}>
          体验 Demo →
        </button>
        <div className="intro-hero-scroll">
          <span>向下滚动</span>
          <div className="intro-hero-scroll-arrow" />
        </div>
      </section>

      {/* ===== Screen 2: Architecture ===== */}
      <section className="intro-screen intro-arch">
        <h2 className="intro-section-title">四层架构设计</h2>
        <p className="intro-section-sub">每一层职责单一，可独立替换和调试</p>
        <div className="intro-arch-layout">
          <div className="intro-arch-layers">
            <div className="intro-arch-card">
              <span className="intro-arch-tag intro-arch-tag-blue">状态层</span>
              <div className="intro-arch-card-body">
                <div className="intro-arch-card-name">Memory</div>
                <div className="intro-arch-card-desc">持有用户的三层记忆，跨轮次不丢失</div>
              </div>
            </div>
            <div className="intro-arch-arrow">↓</div>
            <div className="intro-arch-card">
              <span className="intro-arch-tag intro-arch-tag-purple">主控层</span>
              <div className="intro-arch-card-body">
                <div className="intro-arch-card-name">Controller</div>
                <div className="intro-arch-card-desc">理解意图、决定下一步，用 Haiku 轻量推理</div>
              </div>
            </div>
            <div className="intro-arch-arrow">↓</div>
            <div className="intro-arch-card">
              <span className="intro-arch-tag intro-arch-tag-orange">执行层</span>
              <div className="intro-arch-card-body">
                <div className="intro-arch-card-name">Executor</div>
                <div className="intro-arch-card-desc">结构化任务执行，计划生成 / 调整 / 档案更新</div>
              </div>
            </div>
            <div className="intro-arch-arrow">↓</div>
            <div className="intro-arch-card">
              <span className="intro-arch-tag intro-arch-tag-green">说话层</span>
              <div className="intro-arch-card-body">
                <div className="intro-arch-card-name">Speaker</div>
                <div className="intro-arch-card-desc">统一人设输出，用 Sonnet 保证说话质量</div>
              </div>
            </div>
          </div>

          <div className="intro-arch-note">
            <div className="intro-arch-note-label">模型分工</div>
            主控和说话层用不同模型，Haiku 负责快速决策，Sonnet 负责自然表达，在速度和质量之间取得平衡。
          </div>
        </div>
      </section>

      {/* ===== Screen 3: Memory ===== */}
      <section className="intro-screen intro-memory">
        <h2 className="intro-section-title">三层 Memory，让阿福记住你</h2>
        <p className="intro-section-sub">显式状态管理，可控、可调试、可随时查看</p>
        <div className="intro-memory-cols">
          <div className="intro-memory-card">
            <div className="intro-memory-icon">🗂️</div>
            <div className="intro-memory-name">Long-term Memory</div>
            <div className="intro-memory-cn">长期记忆</div>
            <div className="intro-memory-items">健康目标、限制条件、健康指标</div>
            <div className="intro-memory-example">"空腹血糖 6.2"<br />"下班晚到9点"</div>
          </div>
          <div className="intro-memory-card">
            <div className="intro-memory-icon">📋</div>
            <div className="intro-memory-name">Working Memory</div>
            <div className="intro-memory-cn">工作记忆</div>
            <div className="intro-memory-items">当前计划、执行状态、计划进度</div>
            <div className="intro-memory-example">has_active_plan<br />plan_status</div>
          </div>
          <div className="intro-memory-card">
            <div className="intro-memory-icon">💬</div>
            <div className="intro-memory-name">Dialogue Memory</div>
            <div className="intro-memory-cn">对话记忆</div>
            <div className="intro-memory-items">当前话题、对话阶段、待承接意图</div>
            <div className="intro-memory-example">pending_intent 让"可以的"被正确承接</div>
          </div>
        </div>
        <div className="intro-memory-flow">
          <span className="intro-memory-flow-step">用户说"下班晚到9点"</span>
          <span className="intro-memory-flow-arrow">→</span>
          <span className="intro-memory-flow-step">主控识别为限制条件</span>
          <span className="intro-memory-flow-arrow">→</span>
          <span className="intro-memory-flow-step">写入 Long-term Memory</span>
          <span className="intro-memory-flow-arrow">→</span>
          <span className="intro-memory-flow-step">计划生成时自动带入</span>
          <span className="intro-memory-flow-arrow">→</span>
          <span className="intro-memory-flow-step">给出适合晚归作息的方案</span>
        </div>
      </section>

      {/* ===== Screen 4: Design Decisions ===== */}
      <section className="intro-screen intro-decisions">
        <h2 className="intro-section-title">三个值得说的设计判断</h2>
        <p className="intro-section-sub">不是功能堆砌，是有意识的取舍</p>
        <div className="intro-decisions-cards">
          <div className="intro-decision-card">
            <span className="intro-decision-num">决策 01</span>
            <div className="intro-decision-q">为什么不用 Workflow</div>
            <div className="intro-decision-problem">Workflow 控制流是死的，"可以的"这类模糊输入套模板会走错分支</div>
            <div className="intro-decision-answer">主控层用 LLM 自由推理，不用固定分支判断意图</div>
          </div>
          <div className="intro-decision-card">
            <span className="intro-decision-num">决策 02</span>
            <div className="intro-decision-q">为什么不上 Multi-Agent</div>
            <div className="intro-decision-problem">单用户、单对话、线性推进，没有并发任务分解需求</div>
            <div className="intro-decision-answer">单 Agent + 工具调用，能说清楚为什么不用比硬上更重要</div>
          </div>
          <div className="intro-decision-card">
            <span className="intro-decision-num">决策 03</span>
            <div className="intro-decision-q">状态为什么不放在 Context 里</div>
            <div className="intro-decision-problem">对话历史越来越长，靠 context 维持状态成本高且不可靠</div>
            <div className="intro-decision-answer">显式三层 Memory，可控、可调试、可随时查看</div>
          </div>
        </div>
      </section>

      {/* ===== Screen 5: Demo ===== */}
      <section className="intro-screen intro-demo">
        <h2 className="intro-section-title">产品演示</h2>
        <p className="intro-section-sub">点击体验完整对话流程</p>
        <div className="intro-demo-screenshots">
          <div className="intro-demo-shot">
            <span className="intro-demo-shot-icon">🏠</span>
            <span className="intro-demo-shot-label">首页引导页</span>
          </div>
          <div className="intro-demo-shot">
            <span className="intro-demo-shot-icon">🧠</span>
            <span className="intro-demo-shot-label">对话 + 思考过程组件</span>
          </div>
          <div className="intro-demo-shot">
            <span className="intro-demo-shot-icon">📋</span>
            <span className="intro-demo-shot-label">计划生成</span>
          </div>
          <div className="intro-demo-shot">
            <span className="intro-demo-shot-icon">🗂️</span>
            <span className="intro-demo-shot-label">健康档案</span>
          </div>
        </div>
        <div className="intro-demo-cta-wrap">
          <button className="intro-demo-cta" onClick={goHome}>
            立即体验阿福 →
          </button>
          <p className="intro-demo-note">
            Demo 部署在 Render<br />
            首次访问需要等待服务唤醒（约10秒）
          </p>
        </div>
      </section>

    </div>
  );
}
