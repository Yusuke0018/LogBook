'use client';

import { useState, useEffect, useCallback } from 'react';
import { selectTodaysQuestion, getTodayDateString, isQuestionTime, getTotalQuestionCount } from '@/lib/utils/dailyQuestion';
import {
  createQuestionAnswer,
  getQuestionAnswerForDate,
  getAnsweredQuestionIds,
} from '@/lib/services/questionAnswers';
import type { Question, QuestionAnswer } from '@/lib/types';

interface DailyQuestionProps {
  userId: string;
  onAnswerSubmitted?: () => void;
}

const DEPTH_LABELS: Record<number, string> = {
  1: '軽い（10秒）',
  2: '中程度（30秒）',
  3: '深い（1-2分）',
};

export default function DailyQuestion({ userId, onAnswerSubmitted }: DailyQuestionProps) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [todaysAnswer, setTodaysAnswer] = useState<QuestionAnswer | null>(null);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showQuestion, setShowQuestion] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const loadQuestion = useCallback(async () => {
    try {
      setLoading(true);
      const today = getTodayDateString();

      // 今日の回答があるか確認
      const existingAnswer = await getQuestionAnswerForDate(userId, today);
      if (existingAnswer) {
        setTodaysAnswer(existingAnswer);
        setShowQuestion(true);
        setLoading(false);
        return;
      }

      // 回答済みIDを取得して今日の質問を選択
      const answeredIds = await getAnsweredQuestionIds(userId);
      setAnsweredCount(answeredIds.length);
      const todaysQuestion = selectTodaysQuestion(answeredIds, today);
      setQuestion(todaysQuestion);
      setShowQuestion(isQuestionTime());
    } catch (error) {
      console.error('質問読み込みエラー:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadQuestion();

    // 21時をまたぐ場合のために1分ごとにチェック
    const interval = setInterval(() => {
      if (!showQuestion && isQuestionTime()) {
        setShowQuestion(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [loadQuestion, showQuestion]);

  const handleSubmit = async () => {
    if (!question || !answer.trim()) return;

    setSubmitting(true);
    try {
      await createQuestionAnswer(userId, {
        questionId: question.id,
        questionText: question.text,
        questionCategoryName: question.categoryName,
        questionDepth: question.depth,
        answer: answer.trim(),
        date: getTodayDateString(),
      });

      // 回答済みに切り替え
      const saved = await getQuestionAnswerForDate(userId, getTodayDateString());
      setTodaysAnswer(saved);
      setAnswer('');
      onAnswerSubmitted?.();
    } catch (error) {
      console.error('回答送信エラー:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;
  if (!showQuestion) return null;

  // 回答済み → コンパクトな完了カード
  if (todaysAnswer) {
    return (
      <div className="card p-5 animate-fade-in border-l-4 border-emerald-400 dark:border-emerald-500">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl shrink-0">
            <svg className="h-5 w-5 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">
              今日の問いかけ — 回答済み
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Q. {todaysAnswer.questionText}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              A. {todaysAnswer.answer}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 未回答 → 質問カード + テキストエリア + 送信ボタン
  if (!question) return null;

  const totalQuestions = getTotalQuestionCount();
  const progress = Math.min(answeredCount, totalQuestions);

  return (
    <div className="card p-6 animate-fade-in border-l-4 border-violet-400 dark:border-violet-500">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl shrink-0">
          <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-violet-600 dark:text-violet-400">
              今日の問いかけ
            </p>
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {question.categoryName} · {DEPTH_LABELS[question.depth]}
            </span>
          </div>
          <p className="text-base font-medium text-gray-900 dark:text-white">
            {question.text}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            {progress} / {totalQuestions} 問回答済み
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="1〜3文で、思い浮かんだことをそのまま…"
          rows={2}
          className="w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm resize-none"
        />
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || submitting}
            className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                送信中...
              </>
            ) : (
              '回答する'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
