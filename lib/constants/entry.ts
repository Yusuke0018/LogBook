export const MOOD_SCALE = [
  { value: 1, label: 'とても低い', emoji: '😞' },
  { value: 2, label: 'やや低い', emoji: '🙁' },
  { value: 3, label: 'ふつう', emoji: '😐' },
  { value: 4, label: 'やや高い', emoji: '🙂' },
  { value: 5, label: 'とても高い', emoji: '😄' },
] as const;

export const MOOD_EMOJI_MAP = MOOD_SCALE.reduce<Record<number, string>>(
  (acc, item) => {
    acc[item.value] = item.emoji;
    return acc;
  },
  {}
);

export const MOOD_LABEL_MAP = MOOD_SCALE.reduce<Record<number, string>>(
  (acc, item) => {
    acc[item.value] = item.label;
    return acc;
  },
  {}
);
