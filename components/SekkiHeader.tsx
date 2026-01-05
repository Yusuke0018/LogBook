'use client';

import { useState, useEffect } from 'react';
import { getCurrentSekki, getNextSekki, getDaysUntilNextSekki, SekkiInfo } from '@/lib/sekki';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface SekkiHeaderProps {
  className?: string;
}

export default function SekkiHeader({ className = '' }: SekkiHeaderProps) {
  const [currentSekki, setCurrentSekki] = useState<SekkiInfo | null>(null);
  const [nextSekki, setNextSekki] = useState<SekkiInfo | null>(null);
  const [daysUntilNext, setDaysUntilNext] = useState<number | null>(null);

  useEffect(() => {
    const now = new Date();
    setCurrentSekki(getCurrentSekki(now));
    setNextSekki(getNextSekki(now));
    setDaysUntilNext(getDaysUntilNextSekki(now));
  }, []);

  if (!currentSekki) return null;

  const seasonIcons: Record<string, string> = {
    spring: '🌸',
    summer: '🌻',
    autumn: '🍂',
    winter: '❄️',
  };

  return (
    <div className={`sekki-header sticky top-0 z-20 ${className}`}>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-3 px-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{seasonIcons[currentSekki.season]}</span>
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {currentSekki.name}
          </span>
        </div>

        {nextSekki && daysUntilNext !== null && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span className="hidden sm:inline">|</span>
            <span>
              次は <span className="font-semibold">{nextSekki.name}</span>
              <span className="ml-1">
                （あと<span className="font-semibold text-primary-600 dark:text-primary-400">{daysUntilNext}</span>日）
              </span>
            </span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span>|</span>
          <span>{currentSekki.description}</span>
        </div>
      </div>
    </div>
  );
}
