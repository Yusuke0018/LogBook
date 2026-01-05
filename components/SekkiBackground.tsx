'use client';

import { useState, useEffect } from 'react';
import { getCurrentSekki, SekkiInfo } from '@/lib/sekki';
import SekkiHeader from './SekkiHeader';
import SeasonalAnimation from './SeasonalAnimation';

interface SekkiBackgroundProps {
  children: React.ReactNode;
}

export default function SekkiBackground({ children }: SekkiBackgroundProps) {
  const [currentSekki, setCurrentSekki] = useState<SekkiInfo | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setCurrentSekki(getCurrentSekki(now));
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen">
        {children}
      </div>
    );
  }

  const bgClass = currentSekki ? `bg-${currentSekki.name}` : '';

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {currentSekki && <SeasonalAnimation sekkiName={currentSekki.name} />}
      <SekkiHeader />
      {children}
    </div>
  );
}
