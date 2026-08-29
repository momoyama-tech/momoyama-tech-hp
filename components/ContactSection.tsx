'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react';

const serviceTypes = [
  'Webサイト・LP制作',
  '業務ツール・システム開発',
  'プロジェクションマッピング・映像制作',
  'プログラミング教室・ワークショップ',
  '学生プロジェクト・共創のご相談',
  'その他'
];

export const ContactSection: React.FC = () => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState('Webサイト・LP制作');
  const [budgetDeadline, setBudgetDeadline] = useState('');
  const [message, setMessage] = useState('');
  const [honeyPot, setHoneyPot] = useState('');

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const sectionRef = useRef<HTMLElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'submitting') return;

    if (honeyPot) {
      setStatus('success');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          company,
          email,
          serviceType,
          budgetDeadline,
          message,
          _hp: honeyPot
        })
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || '送信に失敗しました。時間をおいて再送信してください。');
      }

      setStatus('success');
      setName('');
      setCompany('');
      setEmail('');
      setServiceType('Webサイト・LP制作');
      setBudgetDeadline('');
      setMessage('');
    } catch (err: any) {
      console.error('Contact Form Error:', err);
      setStatus('error');
      setErrorMessage(err?.message || '通信エラーが発生しました。時間をおいて再度お試しください。');
    }
  };

  return (
    <section
      id="contact-form"
      ref={sectionRef}
      className="relative py-32 z-20 overflow-hidden"
      style={{ scrollMarginTop: '80px' }}
    >
      {/* Ambient Glow */}
      <div
        className="w-[500px] h-[500px] rounded-full bg-white/2 dark:bg-white/3 blur-[120px] pointer-events-none absolute -top-20 -left-20"
        aria-hidden="true"
      />
      <div
        className="w-[600px] h-[600px] rounded-full bg-cyan-500/1.5 dark:bg-cyan-500/2.5 blur-[140px] pointer-events-none absolute -bottom-24 -right-24"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="mb-16">
          <div className="overflow-hidden mb-3">
            <p
              className={`font-mono text-xs tracking-[0.25em] text-zinc-500 uppercase transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              Contact & Consultation
            </p>
          </div>

          <div className="overflow-hidden">
            <h2
              className={`font-light text-3xl sm:text-4xl md:text-5xl tracking-tight text-zinc-900 dark:text-zinc-100 transition-all duration-1000 delay-100 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                isIntersecting ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
              }`}
            >
              お問い合わせ
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

        {/* Form Container with Spotlight */}
        <div
          onMouseMove={handleMouseMove}
          className="group relative rounded-2xl p-8 sm:p-12 md:p-14 bg-zinc-500/5 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-white/10 backdrop-blur-sm transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-zinc-500/10 dark:hover:bg-zinc-900/70 overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                'radial-gradient(600px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(255,255,255,0.05), transparent 40%)'
            }}
          />

          <div className="relative z-10 flex items-center justify-between pb-6 mb-8 border-b border-zinc-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-6 h-px bg-zinc-400 dark:bg-zinc-600" />
              <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 uppercase">
                ONLINE INQUIRY FORM
              </span>
            </div>
            <Mail className="h-4 w-4 text-zinc-400" />
          </div>

          {status === 'success' ? (
            <div className="relative z-10 py-16 text-center flex flex-col items-center justify-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border border-zinc-300 dark:border-white/10">
                <CheckCircle2 className="h-8 w-8 stroke-1 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-light tracking-tight text-zinc-900 dark:text-white mb-3">
                送信が完了いたしました
              </h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md text-sm leading-relaxed mb-8 font-light">
                お問い合わせいただき誠にありがとうございます。<br />
                内容を確認の上、担当者より通常2〜3営業日以内にご連絡差し上げます。
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="inline-flex items-center gap-2 rounded-lg px-6 py-2.5 text-xs font-mono tracking-widest uppercase bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-colors"
              >
                Reopen Form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="hidden" aria-hidden="true">
                <label htmlFor="hp_field_react_min2">Do not fill this</label>
                <input
                  type="text"
                  id="hp_field_react_min2"
                  name="hp_field"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeyPot}
                  onChange={(e) => setHoneyPot(e.target.value)}
                />
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="r2-name" className="font-mono text-xs tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                      Name / お名前
                    </label>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Required</span>
                  </div>
                  <input
                    type="text"
                    id="r2-name"
                    required
                    placeholder="山田 太郎"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg px-4 py-3.5 text-sm bg-white/70 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="r2-company" className="font-mono text-xs tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                      Organization / 組織名・学校名
                    </label>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Optional</span>
                  </div>
                  <input
                    type="text"
                    id="r2-company"
                    placeholder="株式会社〇〇 / 桃山学院大学"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full rounded-lg px-4 py-3.5 text-sm bg-white/70 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                  />
                </div>
              </div>

              <div className="grid gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="r2-email" className="font-mono text-xs tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                      Email / メールアドレス
                    </label>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Required</span>
                  </div>
                  <input
                    type="email"
                    id="r2-email"
                    required
                    placeholder="taro@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg px-4 py-3.5 text-sm bg-white/70 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="r2-service" className="font-mono text-xs tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                      Category / ご相談種別
                    </label>
                    <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Required</span>
                  </div>
                  <select
                    id="r2-service"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="w-full rounded-lg px-4 py-3.5 text-sm bg-white/70 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/10 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type} className="bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="r2-budget" className="font-mono text-xs tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                    Budget & Timeline / ご予算・希望納期
                  </label>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Optional</span>
                </div>
                <input
                  type="text"
                  id="r2-budget"
                  placeholder="例: ご予算10〜20万円 / 2026年秋頃の納品希望"
                  value={budgetDeadline}
                  onChange={(e) => setBudgetDeadline(e.target.value)}
                  className="w-full rounded-lg px-4 py-3.5 text-sm bg-white/70 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="r2-msg" className="font-mono text-xs tracking-wider text-zinc-700 dark:text-zinc-300 uppercase">
                    Message / ご相談内容の詳細
                  </label>
                  <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">Required</span>
                </div>
                <textarea
                  id="r2-msg"
                  required
                  rows={5}
                  placeholder="ご相談内容やプロジェクトの概要・ご要望についてご記入ください。"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full resize-none rounded-lg px-4 py-3.5 text-sm bg-white/70 dark:bg-zinc-950/60 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-white/10 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-300 transition-colors"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-4 text-xs font-mono text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <p>{errorMessage}</p>
                </div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="group relative inline-flex items-center gap-3 rounded-lg px-8 py-3.5 text-xs font-mono tracking-[0.2em] uppercase bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-sm"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Inquiry</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
