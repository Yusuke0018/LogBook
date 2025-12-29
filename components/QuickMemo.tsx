'use client';

import { useState, useRef, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  PlusIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import type { Memo } from '@/lib/types';

const MAX_LENGTH = 140;

interface QuickMemoProps {
  memos: Memo[];
  onSubmit: (content: string) => Promise<void>;
  onDelete: (memoId: string) => Promise<void>;
}

export default function QuickMemo({
  memos,
  onSubmit,
  onDelete,
}: QuickMemoProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const remainingChars = MAX_LENGTH - content.length;
  const isOverLimit = remainingChars < 0;
  const canSubmit = content.trim().length > 0 && !isOverLimit && !isSubmitting;

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
      setIsOpen(false);
    } catch (error) {
      console.error('メモ投稿エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* FABボタン - スマホで押しやすい位置に固定 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all active:scale-95"
        aria-label="メモを追加"
      >
        <PlusIcon className="h-7 w-7" />
      </button>

      {/* クイック入力モーダル */}
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => setIsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end sm:items-center justify-center p-0 sm:p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="w-full sm:max-w-md transform overflow-hidden rounded-t-3xl sm:rounded-2xl bg-white dark:bg-gray-800 shadow-2xl transition-all">
                  {/* ハンドルバー（モバイル用） */}
                  <div className="sm:hidden flex justify-center pt-3">
                    <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                  </div>

                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <Dialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
                        📝 クイックメモ
                      </Dialog.Title>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <textarea
                        ref={textareaRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={handleKeyDown}
                        rows={4}
                        maxLength={MAX_LENGTH + 10}
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border-0 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-primary-500 resize-none text-base"
                        placeholder="今思ったことをメモ..."
                      />

                      <div className="flex justify-between items-center">
                        <span
                          className={`text-sm font-medium ${
                            isOverLimit
                              ? 'text-red-500'
                              : remainingChars <= 20
                              ? 'text-yellow-500'
                              : 'text-gray-400'
                          }`}
                        >
                          残り {remainingChars} 文字
                        </span>
                        <button
                          onClick={handleSubmit}
                          disabled={!canSubmit}
                          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl hover:from-primary-600 hover:to-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                          <PaperAirplaneIcon className="h-4 w-4" />
                          {isSubmitting ? '送信中...' : '投稿'}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 text-center">
                        ⌘/Ctrl + Enter で送信
                      </p>
                    </div>
                  </div>

                  {/* 今日のメモ一覧（モーダル内） */}
                  {memos.length > 0 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 px-5 py-4 max-h-60 overflow-y-auto">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                        今日のメモ ({memos.length})
                      </h4>
                      <div className="space-y-2">
                        {memos.map((memo) => (
                          <div
                            key={memo.id}
                            className="group flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 dark:text-gray-200 break-words">
                                {memo.content}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {format(memo.createdAt.toDate(), 'HH:mm', {
                                  locale: ja,
                                })}
                              </p>
                            </div>
                            <button
                              onClick={() => onDelete(memo.id)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 transition-all"
                              title="削除"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
