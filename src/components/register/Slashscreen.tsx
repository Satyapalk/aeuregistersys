'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const statusMessages = [
  'កំពុងភ្ជាប់ទៅកាន់ប្រព័ន្ធ...',
  'កំពុងផ្ទុកទិន្នន័យជំនាញសិក្សា...',
  'កំពុងរៀបចំទម្រង់ចុះឈ្មោះ...',
  'រួចរាល់! កំពុងបញ្ជូន...',
];

interface SlashscreenProps {
  onComplete?: () => void;
  redirectTo?: string;
}

export default function Slashscreen({ onComplete, redirectTo = '/Identity/Account/Register' }: SlashscreenProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((current) => Math.min(current + Math.floor(Math.random() * 12) + 5, 100));
    }, 180);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress !== 100) return;
    const exitTimer = window.setTimeout(() => setExiting(true), 400);
    const redirect = window.setTimeout(() => {
      if (onComplete) onComplete();
      else router.push(redirectTo);
    }, 900);
    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(redirect);
    };
  }, [progress, router, onComplete, redirectTo]);

  const statusIndex = progress < 30 ? 0 : progress < 65 ? 1 : progress < 90 ? 2 : 3;

  return (
    <main className={`splash-brand-page ${exiting ? 'splash-exit' : ''}`}>
      <section className="splash-brand-panel">
        <div className="splash-brand-ring splash-brand-ring-top" />
        <div className="splash-brand-ring splash-brand-ring-bottom" />
        <div className="splash-brand-content">
          <div className="splash-brand-icon"><Image src="/images/aeu-logo.png" alt="Asia Euro University" width={726} height={956} className="splash-brand-logo" /></div>
          <h1>សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប</h1>
          <p>ASIA EURO UNIVERSITY</p>
          <strong>亚 欧 大 学</strong>
          <h2>ទម្រង់ចុះឈ្មោះនិស្សិត</h2>
          <div className="splash-brand-status" aria-live="polite">{progress === 100 ? 'រួចរាល់!' : statusMessages[statusIndex]}</div>
        </div>
        <button className="splash-brand-skip" type="button" onClick={() => { if (onComplete) onComplete(); else router.push(redirectTo); }}>Skip</button>
      </section>
    </main>
  );
}