'use client';

import React from 'react';
import { ArrowUpRight, Code2, Film, GraduationCap, Rocket, Terminal, Sparkles, Users } from 'lucide-react';

export const ServicesSection: React.FC = () => {
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <section
      id="services"
      className="relative py-24 z-30 overflow-hidden text-white"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Ambient Glow */}
      <div
        className="w-[500px] h-[500px] rounded-full bg-cyan-500/4 blur-[140px] pointer-events-none absolute -top-24 -left-24"
        aria-hidden="true"
      />
      <div
        className="w-[600px] h-[600px] rounded-full bg-purple-500/3 blur-[160px] pointer-events-none absolute -bottom-32 -right-32"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="mb-3">
            <p className="font-mono text-xs tracking-[0.25em] text-cyan-400 uppercase font-semibold">
              Student Projects & Capabilities
            </p>
          </div>

          <div>
            <h2 className="font-bold text-3xl sm:text-4xl md:text-5xl tracking-tight text-white mb-4">
              サービス & プロジェクト
            </h2>
            <p className="text-zinc-300 text-base max-w-2xl leading-relaxed">
              桃山学院大学テック部では、学生エンジニア・クリエイターが主体となり、Web・アプリ開発から映像空間演出、次世代のIT教育、共同プロジェクト開発まで熱量あふれるモノづくりを展開しています。
            </p>
          </div>

          <div className="mt-8 relative h-px w-full bg-white/10 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-r from-cyan-500/50 via-white/20 to-transparent" />
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {/* Card 1 */}
          <div
            onMouseMove={handleMouseMove}
            className="group relative md:col-span-2 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#141414]/90 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%)'
              }}
            />
            <div className="font-mono text-7xl md:text-8xl font-black text-white/5 select-none pointer-events-none absolute right-6 bottom-4">
              01
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-cyan-400" />
                  <span className="font-mono text-[11px] tracking-[0.25em] text-zinc-400 uppercase font-medium">
                    WEB & SYSTEM DEVELOPMENT
                  </span>
                </div>
                <div className="text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-7">
                  <div className="mb-5 inline-flex p-3 rounded-xl bg-zinc-800 border border-white/15 text-cyan-400 shadow-md">
                    <Code2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-3">
                    Web・システム開発
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-300 font-normal mb-6">
                    店舗・企業・学校向けの公式ホームページ制作から、業務効率化ツールやWebアプリケーションの受託開発まで対応。モダンなフレームワーク（Next.js / SvelteKit）で高速・高クオリティに構築します。
                  </p>
                </div>

                <div className="md:col-span-5 hidden sm:block">
                  <div className="rounded-xl bg-[#0a0a0a] border border-white/15 p-4 font-mono text-[11px] text-zinc-300 shadow-xl">
                    <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/10">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                      <span className="text-[10px] text-zinc-500 ml-2">app/project.tsx</span>
                    </div>
                    <p className="text-purple-400">const <span className="text-cyan-400">solution</span> = {'{'}</p>
                    <p className="pl-3 text-zinc-300">stack: <span className="text-emerald-400">['Next.js', 'SvelteKit']</span>,</p>
                    <p className="pl-3 text-zinc-300">quality: <span className="text-amber-300">'Production Grade'</span>,</p>
                    <p className="pl-3 text-zinc-300">responsive: <span className="text-blue-400">true</span></p>
                    <p className="text-purple-400">{'}'};</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap gap-2">
              {['#HP制作', '#LP', '#業務ツール', '#Webアプリ'].map((tag) => (
                <span key={tag} className="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2 */}
          <div
            onMouseMove={handleMouseMove}
            className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#141414]/90 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%)'
              }}
            />
            <div className="font-mono text-7xl md:text-8xl font-black text-white/5 select-none pointer-events-none absolute right-6 bottom-4">
              02
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-purple-400" />
                  <span className="font-mono text-[11px] tracking-[0.25em] text-zinc-400 uppercase font-medium">
                    CREATIVE & MAPPING
                  </span>
                </div>
                <div className="text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-5 inline-flex p-3 rounded-xl bg-zinc-800 border border-white/15 text-purple-400 shadow-md">
                <Film className="h-6 w-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
                プロジェクションマッピング & 映像・配信
              </h3>
              <p className="text-sm leading-relaxed text-zinc-300 font-normal mb-6">
                式典や地域イベントのオープニング動画制作、建物を彩るプロジェクションマッピング演出、各種イベントの配信技術サポートまで、空間とデジタルの融合を実現します。
              </p>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap gap-2">
              {['#空間演出', '#式典動画', '#ライブ配信', '#イベント'].map((tag) => (
                <span key={tag} className="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 3 */}
          <div
            onMouseMove={handleMouseMove}
            className="group relative flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#141414]/90 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%)'
              }}
            />
            <div className="font-mono text-7xl md:text-8xl font-black text-white/5 select-none pointer-events-none absolute right-6 bottom-4">
              03
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-emerald-400" />
                  <span className="font-mono text-[11px] tracking-[0.25em] text-zinc-400 uppercase font-medium">
                    EDUCATION & WORKSHOP
                  </span>
                </div>
                <div className="text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="mb-5 inline-flex p-3 rounded-xl bg-zinc-800 border border-white/15 text-emerald-400 shadow-md">
                <GraduationCap className="h-6 w-6" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-3">
                プログラミング教育・ワークショップ
              </h3>
              <p className="text-sm leading-relaxed text-zinc-300 font-normal mb-6">
                地域の子どもたちや学生向けのプログラミング体験教室やIT教育イベントを企画・運営。次世代のクリエイターを育成する体験型ワークショップを提供します。
              </p>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap gap-2">
              {['#地域貢献', '#子ども向け', '#体験講座', '#ITリテラシー'].map((tag) => (
                <span key={tag} className="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Card 4 */}
          <div
            onMouseMove={handleMouseMove}
            className="group relative md:col-span-2 flex flex-col justify-between p-8 sm:p-10 rounded-2xl bg-[#141414]/90 border border-white/10 hover:border-white/30 backdrop-blur-md transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background:
                  'radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.07), transparent 40%)'
              }}
            />
            <div className="font-mono text-7xl md:text-8xl font-black text-white/5 select-none pointer-events-none absolute right-6 bottom-4">
              04
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-0.5 bg-amber-400" />
                  <span className="font-mono text-[11px] tracking-[0.25em] text-zinc-400 uppercase font-medium">
                    STUDENT PROJECTS & COLLABORATION
                  </span>
                </div>
                <div className="text-zinc-400 group-hover:text-white transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                  <ArrowUpRight className="h-5 w-5" />
                </div>
              </div>

              <div className="grid md:grid-cols-12 gap-8 items-start">
                <div className="md:col-span-7">
                  <div className="mb-5 inline-flex p-3 rounded-xl bg-zinc-800 border border-white/15 text-amber-400 shadow-md">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight text-white mb-3">
                    学生主導プロジェクト・共同開発
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-300 font-normal mb-6">
                    学生ならではの柔軟な発想と最新テクノロジーを融合し、企業・地域・学内との共同プロジェクトを推進。企画立案からアジャイル開発、実証実験、プロダクション運用まで、学生チームが主体となってプロジェクトを完遂します。
                  </p>
                </div>

                <div className="md:col-span-5 hidden sm:flex flex-col gap-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0a0a0a] border border-white/15 shadow-md">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span className="text-xs text-zinc-200 font-mono">Team-Driven Development</span>
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#0a0a0a] border border-white/15 shadow-md">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-zinc-200 font-mono">Real-world Project Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex flex-wrap gap-2">
              {['#学生プロジェクト', '#産学連携', '#プロダクト共創', '#アジャイル開発'].map((tag) => (
                <span key={tag} className="font-mono text-xs tracking-wide px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300 font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
