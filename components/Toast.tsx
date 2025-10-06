'use client';

import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
}

export default function Toast({
  show,
  message,
  type = 'success',
}: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Transition
        show={show}
        as={Fragment}
        enter="transform ease-out duration-300 transition"
        enterFrom="translate-y-2 opacity-0"
        enterTo="translate-y-0 opacity-100"
        leave="transition ease-in duration-100"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div
          className={`flex items-center p-4 rounded-lg shadow-lg ${
            type === 'success'
              ? 'bg-green-50 dark:bg-green-900'
              : 'bg-red-50 dark:bg-red-900'
          }`}
        >
          {type === 'success' ? (
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-300 mr-3" />
          ) : (
            <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-300 mr-3" />
          )}
          <p
            className={`text-sm font-medium ${
              type === 'success'
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {message}
          </p>
        </div>
      </Transition>
    </div>
  );
}
