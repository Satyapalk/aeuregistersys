'use client';

import { useState } from 'react';
import RegisterForm from '@/components/RegisterForm';
import Slashscreen from '@/components/register/Slashscreen';

export default function RegisterView() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Slashscreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <main className="register-page">
      <RegisterForm />
    </main>
  );
}