'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Minus } from 'lucide-react';

export interface WorkItem {
  id: string;
  title: string;
  category: string;
  year: string;
  badge?: string;
  description?: string;
  tags?: string[];
}

const defaultWorks: WorkItem[] = [
  {
    id: 'work-1',
    title: '和泉市 市制70周年記念式典 オープニング動画制作',
    category: '映像制作・式典演出',
    year: '2026',
    badge: 'Municipal Ceremony',
    description:
      '和泉市制70周年の節目を祝う記念式典にて、オープニング映像の企画・CG制作・編集を担当。市の歩みと未来への躍進をダイナミックなビジュアルで表現しました。',
    tags: ['#映像制作', '#モーショングラフィックス', '#式典演出', '#自治体連携']
  },
  {
    id: 'work-2',
    title: '大学祭（桃祭） プロジェクションマッピング',
    category: '空間演出 / マッピング',
    year: '2025',
    badge: 'Campus Festival',
    description:
      '桃山学院大学の学園祭にて、校舎壁面を活用したプロジェクションマッピングショーを制作・上映。音と光が連動する空間演出でキャンパスを彩りました。',
    tags: ['#空間演出', '#プロジェクションマッピング', '#学園祭', '#音響連動']
  },
  {
    id: 'work-3',
    title: '商工祭 プロジェクションマッピング',
    category: '地域連携 / 空間演出',
    year: '2025',
    badge: 'Regional Event',
    description:
      '地域の商工祭と連携し、屋外特設ブースでの空間演出およびプロジェクションマッピングを実施。地域住民や子どもたちに向けた参加型演出も手がけました。',
    tags: ['#地域連携', '#イベント演出', '#空間デザイン', '#商工祭']
  }
];

interface WorksSectionProps {
  works?: WorkItem[];
}

export const WorksSection: React.FC<WorksSectionProps> = ({ works = defaultWorks }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [activeId, setActiveId] = useState('work-1');

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const toggleAccordion = (id: string) => {
    setActiveId(activeId === id ? '' : id);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const row = e.currentTarget;
    const rect = row.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    row.style.setProperty('--mouse-x', `${x}px`);
    row.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section
      id="works"
      ref={sectionRef}
      className="relative py-32 z-25 overflow-hidden"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Ambient Glow */}
      <div
        className="w-[500px] h-[500px] rounded-full bg-white/[0.02] dark:bg-white/[0.03] blur-[120px] pointer-events-none absolute -top-24 -right-24"
        aria-hidden="true"
      />
      <div
        className="w-[600px] h-[600px] rounded-full bg-purple-500/[0.015] dark:bg-purple-500/[0.02] blur-[140px] pointer-events-none absolute -bottom-32 -left-32"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="overflow-hidden mb-3">
            <p
              className={`font-mono text-xs tracking-[0.25em] text-zinc-500 uppercase transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              Selected Works & Archives
            </p>
          </div>

          <div className="overflow-hidden">
            <h2
              className={`font-light text-3xl sm:text-4xl md:text-5xl tracking-tight text-zinc-900 dark:text-zinc-100 transition-all duration-1000 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              実績紹介
            </h2>
          </div>

          <div className="mt-8 relative h-px w-full bg-zinc-200 dark:bg-white/10 overflow-hidden">
            <div
              className={`absolute inset-0 bg-zinc-800 dark:bg-zinc-200 origin-left transition-transform duration-1200 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isIntersecting ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </div>
        </div>

        {/* Billboard Live Style: Bordered Accordion List */}
        <div className="border-b border-zinc-200 dark:border-white/10">
          {works.map((item, idx) => {
            const isOpen = activeId === item.id;
            return (
              <div
                key={item.id}
                onMouseMove={handleMouseMove}
                className="group relative border-t border-zinc-200 dark:border-white/10 transition-colors duration-500 hover:bg-zinc-500/[0.03] dark:hover:bg-zinc-900/60 overflow-hidden"
              >
                <div
                  className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      'radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.04), transparent 40%)'
                  }}
                />

                <button
                  type="button"
                  onClick={() => toggleAccordion(item.id)}
                  className="w-full text-left py-8 sm:py-10 px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-6 cursor-pointer relative z-10"
                >
                  <div className="flex items-center gap-6 md:w-1/3">
                    <span className="font-mono text-xs text-zinc-400 dark:text-zinc-600 tracking-widest">
                      0{idx + 1}
                    </span>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-200">{item.year}</span>
                      <span className="text-zinc-300 dark:text-zinc-700">/</span>
                      <span className="tracking-wider text-zinc-500 uppercase">{item.category}</span>
                    </div>
                  </div>

                  <div className="md:w-1/2">
                    <h3 className="text-lg sm:text-xl font-light tracking-tight text-zinc-900 dark:text-zinc-100 group-hover:text-black dark:group-hover:text-white transition-colors">
                      {item.title}
                    </h3>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-4 md:w-1/6">
                    <span className="font-mono text-[10px] tracking-widest text-zinc-400 uppercase hidden lg:inline-block">
                      {item.badge}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-all duration-300">
                      {isOpen ? (
                        <Minus className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      )}
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-6 pb-10 pt-2 relative z-10 transition-all duration-400">
                    <div className="rounded-xl p-6 sm:p-8 bg-zinc-100/50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-white/5 grid md:grid-cols-12 gap-6 items-center">
                      <div className="md:col-span-8">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-4 h-[1px] bg-zinc-400 dark:bg-zinc-600" />
                          <span className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 uppercase">
                            PROJECT OVERVIEW
                          </span>
                        </div>
                        <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-light mb-6">
                          {item.description}
                        </p>
                        {item.tags && (
                          <div className="flex flex-wrap gap-2">
                            {item.tags.map((tag) => (
                              <span key={tag} className="font-mono text-xs tracking-wide text-zinc-500 dark:text-zinc-400">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-4 flex flex-col items-start md:items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-200 dark:border-white/5 pt-4 md:pt-0 md:pl-6">
                        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">RECORD STATUS</span>
                        <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          COMPLETED & ARCHIVED
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorksSection;
