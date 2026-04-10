/**
 * 전체 기능 맵 — 기본은 에이전트 허브·독립 대화(/chat) 중심(젠스파이크형).
 * `REACT_APP_UI_PROJECTS_ENABLED=true` 일 때만 프로젝트·프로젝트 대화 섹션 노출.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Map } from 'lucide-react';
import { AGENTS_PATH } from '../config/routes';
import {
  getStandaloneChatPath,
  isGensparkPrimaryExperience,
  isUiProjectsEnabled,
  STANDALONE_CHAT_PATH,
} from '../config/uiPreferences';

const SECTION_STYLE: React.CSSProperties = {
  marginBottom: 'var(--spacing-3xl)',
};
const TITLE_STYLE: React.CSSProperties = {
  fontSize: 'var(--font-size-lg)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--text-primary)',
  marginBottom: 'var(--spacing-md)',
  paddingBottom: 'var(--spacing-sm)',
  borderBottom: '1px solid var(--border-color)',
};
const LIST_STYLE: React.CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
};
const ITEM_STYLE: React.CSSProperties = {
  padding: 'var(--spacing-sm) 0',
  borderBottom: '1px solid var(--bg-tertiary)',
};
const LINK_STYLE: React.CSSProperties = {
  color: 'var(--accent-info-figma, var(--accent-info))',
  textDecoration: 'none',
  fontWeight: 'var(--font-weight-medium)',
  fontSize: 'var(--font-size-sm)',
};
const DESC_STYLE: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  color: 'var(--text-secondary)',
  marginTop: '2px',
  marginLeft: 0,
};

interface FeatureItem {
  name: string;
  description: string;
  to?: string;
}
interface FeatureSection {
  title: string;
  items: FeatureItem[];
}

const SECTION_HOME_ITEMS: Omit<FeatureItem, 'to'>[] = [
  { name: '독립 대화', description: '홈에서 질의응답·통합 대화' },
  { name: '고급 기능 (TTS·음성·이미지·예측)', description: '대화 내 통합' },
  { name: '감정/의도 분석·대화 요약', description: '대화 내 분석' },
  { name: '파일 첨부·스마트 추천', description: '대화 내 첨부' },
];

function sectionHomeFor(chatPath: string): FeatureSection {
  const title =
    chatPath === STANDALONE_CHAT_PATH ? '일반 대화 (/chat)' : '일반 대화 (/)';
  return {
    title,
    items: SECTION_HOME_ITEMS.map((item) => ({ ...item, to: chatPath })),
  };
}

function withProjectsSections(chatPath: string): FeatureSection[] {
  return [sectionHomeFor(chatPath), ...SECTIONS_WITH_PROJECTS_BASE];
}

function agentsDefaultSections(chatPath: string): FeatureSection[] {
  return [
    sectionHomeFor(chatPath),
    {
      title: `에이전트 (${AGENTS_PATH})`,
      items: [
        { name: '에이전트 허브', description: 'Genspark식 `?id=` 세션·슈퍼 에이전트', to: AGENTS_PATH },
        {
          name: '파이프라인·딥시크 힌트',
          description: '대화 요청에 검수·리파인 힌트 기본 포함(백엔드가 지원 시)',
          to: chatPath,
        },
        {
          name: '노트북·파일 흐름',
          description: `레거시 /notebook·/file-analysis 는 ${chatPath} 로 연결`,
          to: chatPath,
        },
      ],
    },
  ];
}

const SECTIONS_WITH_PROJECTS_BASE: FeatureSection[] = [
  {
    title: '프로젝트 (/projects)',
    items: [
      { name: '프로젝트 목록·생성·관리', description: '프로젝트 CRUD·검색·필터', to: '/projects' },
      { name: '프로젝트별 설정', description: '지침·가이드라인·파일·태그', to: '/projects' },
    ],
  },
  {
    title: '프로젝트 · 대화 (/projects/:id)',
    items: [
      { name: '노트북 LLM', description: '프로젝트별 학습·정리·근거 기반 답변', to: '/projects' },
      { name: '파일 분석·AI 문서 생성', description: '프로젝트 파일 기반 대화·문서 생성', to: '/projects' },
      { name: '프로젝트 컨텍스트 대화', description: '지침·가이드라인·소스 반영 답변', to: '/projects' },
    ],
  },
];

function FeaturesMapView() {
  const uiProjects = isUiProjectsEnabled();
  const chatPath = getStandaloneChatPath();
  const sections = uiProjects ? withProjectsSections(chatPath) : agentsDefaultSections(chatPath);
  const quickLinks = uiProjects
    ? [
        { to: chatPath, label: '일반 대화', desc: '독립 대화' },
        { to: '/projects', label: '프로젝트', desc: '목록·관리' },
      ]
    : [
        { to: chatPath, label: '일반 대화', desc: '독립 대화' },
        { to: AGENTS_PATH, label: '에이전트', desc: '허브·세션' },
      ];
  const intro = uiProjects
    ? '일반 대화·프로젝트·프로젝트 · 대화 세 영역. 프로젝트를 선택하면 해당 프로젝트의 대화 화면으로 들어갑니다.'
    : isGensparkPrimaryExperience()
      ? `첫 화면은 에이전트 허브(${AGENTS_PATH})이며, 독립 일반 대화는 ${STANDALONE_CHAT_PATH} 에서 엽니다. 젠스파이크형 파이프라인·딥시크 검수 힌트는 대화 요청에 기본 포함됩니다.`
      : '홈(/)에서 일반 대화를 하고 에이전트(/agents) 허브를 쓸 수 있습니다. 젠스파이크형 파이프라인·딥시크 검수 힌트는 대화 요청에 기본 포함됩니다.';

  return (
    <div
      className="main-content bw-detail-root bw-detail-root--centered"
      data-testid="features-map-view"
    >
      <div className="bw-detail-header">
        <div className="bw-detail-header-inner">
          <div className="bw-detail-header-left">
            <div className="bw-detail-header-icon">
              <Map size={20} aria-hidden />
            </div>
            <div>
              <h1 className="bw-detail-header-title bw-detail-header-title--xl">
                전체 기능
              </h1>
              <p className="bw-detail-header-desc">
                {intro}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="bw-detail-content bw-detail-tab-content">
      <nav
        className="bw-features-grid"
        role="navigation"
        aria-label="주요 화면 빠른 이동"
      >
        {quickLinks.map(({ to, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="bw-card bw-features-card"
            aria-label={`${label} 화면으로 이동, ${desc}`}
          >
            <div className="bw-features-card-title">{label}</div>
            <div className="bw-features-card-desc">{desc}</div>
          </Link>
        ))}
      </nav>

      {sections.map((section, idx) => (
        <section key={section.title} style={SECTION_STYLE} aria-labelledby={`section-heading-${idx}`}>
          <h2 id={`section-heading-${idx}`} style={TITLE_STYLE}>{section.title}</h2>
          <ul style={LIST_STYLE}>
            {section.items.map((item) => (
              <li key={item.name} style={ITEM_STYLE}>
                {item.to ? (
                  <Link to={item.to} style={LINK_STYLE}>
                    {item.name}
                  </Link>
                ) : (
                  <span className="bw-features-section-item-name">{item.name}</span>
                )}
                <div style={DESC_STYLE}>{item.description}</div>
              </li>
            ))}
          </ul>
        </section>
      ))}
      </div>
    </div>
  );
}

export default FeaturesMapView;
