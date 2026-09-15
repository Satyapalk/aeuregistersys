'use client';

import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';

interface ThanksData {
  nameLatin: string;
  khmerName: string;
  gender: string;
  dob: string;
  phone: string;
  nationality: string;
  degree: string;
  faculty: string;
  major: string;
  grade: string;
  registrationNumber: string;
  studentID: string | null;
}

function readSessionData(): ThanksData | null {
  if (typeof window === 'undefined') return null;
  const stored = sessionStorage.getItem('registerData');
  if (!stored) return null;
  sessionStorage.removeItem('registerData');
  return JSON.parse(stored);
}

function fireConfetti() {
  confetti({
    particleCount: 100,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#2563eb', '#38bdf8', '#7c3aed', '#ea580c', '#ffffff'],
  });
}

const TG_BOT_USERNAME = process.env.NEXT_PUBLIC_TG_BOT_USERNAME || 'AEU_AdmissionsBot';

function telegramDeepLink(code: string): string {
  return `tg://resolve?domain=${TG_BOT_USERNAME}&start=reg_${code}`;
}

export default function Thanks({
  registrationCode,
  registrationDate,
}: {
  registrationCode: string;
  registrationDate: string;
}) {
  const [copied, setCopied] = useState(false);
  const [data] = useState<ThanksData | null>(readSessionData);

  const displayCode = data?.registrationNumber || registrationCode;

  useEffect(() => {
    const timer = window.setTimeout(fireConfetti, 300);
    return () => window.clearTimeout(timer);
  }, []);

  async function copyCode() {
    await navigator.clipboard.writeText(displayCode);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <main className="thanks-page">
      <div className="thanks-orb thanks-orb-one" /><div className="thanks-orb thanks-orb-two" /><div className="thanks-orb thanks-orb-three" />
      <section className="thanks-card">
        <header className="thanks-header">
          <div className="thanks-watermark"><i className="fa-solid fa-graduation-cap" /></div>
          <div className="thanks-badge"><i className="fa-solid fa-circle-check" /></div>
          <span className="thanks-kicker"><i className="fa-solid fa-sparkles" /> ចុះឈ្មោះបានជោគជ័យ</span>
          <h1>សូមអរគុណសម្រាប់ការចុះឈ្មោះ!</h1>
          <p>
            ការចុះឈ្មោះចូលសិក្សានៅ <b>សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប</b> សម្រាប់ឆ្នាំសិក្សា ២០២៦-២០២៧ ត្រូវទទួលបានជោគជ័យ។
          </p>
        </header>

        <div className="thanks-body">
          <div className="registration-code-card">
            <span className="registration-code-card-tag">លេខកូដចុះឈ្មោះ (Register Number)</span>
            <div className="registration-code-card-value">
              <strong className="registration-code-card-code">{displayCode}</strong>
              <button type="button" className="registration-code-card-copy" onClick={copyCode} title="ចម្លងលេខកូដ">
                <i className="fa-regular fa-copy" />
              </button>
            </div>
            <p className="registration-code-card-note">
              <i className="fa-solid fa-circle-info" /> សូមរក្សាទុកលេខកូដនេះសម្រាប់ទំនាក់ទំនងជាមួយការិយាល័យសិក្សា ឬបង់ថ្លៃសិក្សា។
            </p>
          </div>

          <a
            href={telegramDeepLink(displayCode)}
            target="_blank"
            rel="noopener noreferrer"
            className="thanks-telegram-cta"
          >
            <i className="fa-brands fa-telegram" />
            <span>ទាក់ទងការិយាល័យតាម Telegram</span>
          </a>
          <p className="thanks-telegram-note">
            បើក Telegram ហើយប៉ះតំណ ដើម្បីភ្ជាប់ការចុះឈ្មោះរបស់អ្នកដោយស្វ័យប្រវត្តិ
          </p>

          <div className="thanks-info">
            <div className="thanks-info-card thanks-info-card-blue">
              <div className="thanks-info-card-icon"><i className="fa-solid fa-university" /></div>
              <div>
                <small>គ្រឹះស្ថានសិក្សា</small>
                <b>សាកលវិទ្យាល័យ អាស៊ី អឺរ៉ុប</b>
              </div>
            </div>
            <div className="thanks-info-card thanks-info-card-purple">
              <div className="thanks-info-card-icon thanks-info-card-icon-purple"><i className="fa-solid fa-calendar-check" /></div>
              <div>
                <small>កាលបរិច្ឆេទចុះឈ្មោះ</small>
                <b>{registrationDate}</b>
              </div>
            </div>
          </div>

          <div className="thanks-steps">
            <h3><span><i className="fa-solid fa-list-check" /></span> ជំហានបន្តបន្ទាប់ (Next Steps)</h3>
            <ul>
              <li><i className="fa-solid fa-circle-check thanks-step-blue" /><span>ក្រុមការងារការិយាល័យចុះឈ្មោះនឹងទាក់ទងមកកាន់លេខទូរស័ព្ទរបស់លោកអ្នកក្នុងពេលឆាប់ៗ។</span></li>
              <li><i className="fa-solid fa-circle-check thanks-step-purple" /><span>លោកអ្នកអាចអញ្ជើញមកកាន់សាកលវិទ្យាល័យដោយផ្ទាល់ដើម្បីបំពេញសំណុំឯកសារ និងបង់ថ្លៃសិក្សា។</span></li>
              <li><i className="fa-solid fa-circle-check thanks-step-orange" /><span>សូមរៀបចំឯកសារភ្ជាប់៖ រូបថត (4x6), អត្តសញ្ញាណប័ណ្ណ, និងសញ្ញាបត្របាក់ឌុប។</span></li>
            </ul>
          </div>

          <div className="thanks-actions">
            <button type="button" className="thanks-action-print" onClick={() => window.print()}>
              <i className="fa-solid fa-print" />
              <span>បោះពុម្ពបង្កាន់ដៃ (Print)</span>
            </button>
            <button type="button" className="thanks-action-confetti" onClick={fireConfetti}>
              <i className="fa-solid fa-hands-clapping" />
              <span>អបអរសាទរម្តងទៀត!</span>
            </button>
          </div>
        </div>

        <footer>© 2026 Asia Euro University. All rights reserved.</footer>
      </section>

      {copied && (
        <div className="copy-toast">
          <i className="fa-solid fa-circle-check" />
          <span>បានចម្លងលេខកូដចុះឈ្មោះដោយជោគជ័យ!</span>
        </div>
      )}
    </main>
  );
}