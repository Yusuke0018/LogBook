'use client';

import { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

interface CalendarProps {
  entryDates: Date[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({
  entryDates,
  onDateSelect,
  selectedDate,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { locale: ja });
  const calendarEnd = endOfWeek(monthEnd, { locale: ja });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const hasEntry = (date: Date) => {
    return entryDates.some((entryDate) => isSameDay(entryDate, date));
  };

  const isSelected = (date: Date) => {
    return selectedDate ? isSameDay(selectedDate, date) : false;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentMonth, 'yyyy年MM月', { locale: ja })}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}

        {days.map((day) => (
          <button
            key={day.toString()}
            onClick={() => onDateSelect(day)}
            className={`
              aspect-square p-1 text-sm rounded-lg transition-colors
              ${
                !isSameMonth(day, currentMonth)
                  ? 'text-gray-400 dark:text-gray-600'
                  : 'text-gray-900 dark:text-white'
              }
              ${
                hasEntry(day)
                  ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }
              ${
                isSelected(day)
                  ? 'ring-2 ring-blue-500 dark:ring-blue-400'
                  : ''
              }
            `}
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
}
