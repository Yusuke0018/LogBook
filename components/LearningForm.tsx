'use client';

import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface LearningFormProps {
  onSubmit: (content: string, tags: string[], source: string) => Promise<void>;
}

export default function LearningForm({ onSubmit }: LearningFormProps) {
  const [content, setContent] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [source, setSource] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      const tags = tagInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      await onSubmit(content.trim(), tags, source.trim());
      setContent('');
      setTagInput('');
      setSource('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="学んだことをペースト..."
        rows={4}
        className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm resize-y"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="タグ（カンマ区切り）"
          className="px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          placeholder="出典（URL等、任意）"
          className="px-4 py-2.5 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
        />
      </div>
      <button
        type="submit"
        disabled={!content.trim() || submitting}
        className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-secondary-500 rounded-button hover:from-primary-600 hover:to-secondary-600 shadow-soft hover:shadow-soft-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <PlusIcon className="h-4 w-4" />
        {submitting ? '保存中...' : '保存'}
      </button>
    </form>
  );
}
