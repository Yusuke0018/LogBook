import questionsData from '@/lib/data/dailyQuestions.json';
import type { Question } from '@/lib/types';

/**
 * JSONからフラット化された全質問リストを生成
 */
function getAllQuestions(): Question[] {
  const questions: Question[] = [];
  for (const category of questionsData.categories) {
    for (const q of category.questions) {
      questions.push({
        id: q.id,
        text: q.text,
        depth: q.depth,
        categoryId: category.id,
        categoryName: category.name,
      });
    }
  }
  return questions;
}

const ALL_QUESTIONS = getAllQuestions();

/**
 * 日付文字列から決定論的ハッシュ値を生成
 * 同じ日は何度開いても同じ値を返す
 */
function dateHash(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * 今日の日付文字列を取得 (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 回答済みIDリストから今日の質問を選択
 * - 未回答プールから日付ハッシュで1つ選択
 * - 全155問回答済みの場合はプールをリセット
 * - 同じ日は何度開いても同じ質問
 */
export function selectTodaysQuestion(
  answeredQuestionIds: number[],
  dateStr?: string
): Question {
  const today = dateStr || getTodayDateString();
  const answeredSet = new Set(answeredQuestionIds);

  // 未回答プールを作成
  let pool = ALL_QUESTIONS.filter((q) => !answeredSet.has(q.id));

  // 全問回答済みならリセット
  if (pool.length === 0) {
    pool = ALL_QUESTIONS;
  }

  // 日付ハッシュでプールから1つ選択（決定論的）
  const hash = dateHash(today);
  const index = hash % pool.length;
  return pool[index];
}

/**
 * 21時以降かどうかを判定
 */
export function isQuestionTime(): boolean {
  const now = new Date();
  return now.getHours() >= 21;
}

/**
 * 全質問数を取得
 */
export function getTotalQuestionCount(): number {
  return ALL_QUESTIONS.length;
}
