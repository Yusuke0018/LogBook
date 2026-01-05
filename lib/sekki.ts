// 二十四節気データと計算ヘルパー

export interface SekkiInfo {
  name: string;
  date: Date;
  season: 'spring' | 'summer' | 'autumn' | 'winter';
  description: string;
}

export const sekkiData: Record<number, SekkiInfo[]> = {
  2025: [
    { name: '小寒', date: new Date('2025-01-05T11:33:00'), season: 'winter', description: '寒さが最も厳しくなる前の時期。この日から寒の入りとなります。' },
    { name: '大寒', date: new Date('2025-01-20T05:00:00'), season: 'winter', description: '一年で最も寒さが厳しい時期。寒稽古など、寒さを利用した行事が行われます。' },
    { name: '立春', date: new Date('2025-02-03T23:10:00'), season: 'spring', description: '暦の上での春の始まり。梅の花が咲き始め、徐々に暖かくなり始めます。' },
    { name: '雨水', date: new Date('2025-02-18T19:07:00'), season: 'spring', description: '雪が雨に変わり、積もった雪が溶け始める頃。農耕の準備を始める目安です。' },
    { name: '啓蟄', date: new Date('2025-03-05T17:07:00'), season: 'spring', description: '冬ごもりしていた虫が、春の暖かさを感じて地中から姿を現す頃。' },
    { name: '春分', date: new Date('2025-03-20T18:01:00'), season: 'spring', description: '昼と夜の長さがほぼ等しくなる日。自然をたたえ生物をいつくしむ日です。' },
    { name: '清明', date: new Date('2025-04-04T21:49:00'), season: 'spring', description: '万物が清らかで明るく、生き生きとした様子を見せる頃。花見の季節です。' },
    { name: '穀雨', date: new Date('2025-04-20T04:56:00'), season: 'spring', description: '春の雨が降り、穀物の成長を助ける頃。種まきの好機とされています。' },
    { name: '立夏', date: new Date('2025-05-05T14:57:00'), season: 'summer', description: '暦の上での夏の始まり。新緑が美しく、過ごしやすい気候になります。' },
    { name: '小満', date: new Date('2025-05-21T03:55:00'), season: 'summer', description: '陽気が良くなり、万物が成長して天地に満ち始める頃。麦の穂が実り始めます。' },
    { name: '芒種', date: new Date('2025-06-05T18:57:00'), season: 'summer', description: '稲などの穀物の種をまく時期。梅雨入りの頃でもあります。' },
    { name: '夏至', date: new Date('2025-06-21T11:42:00'), season: 'summer', description: '一年で最も昼が長く夜が短い日。本格的な夏の到来を告げます。' },
    { name: '小暑', date: new Date('2025-07-07T05:05:00'), season: 'summer', description: '暑さが本格的になる頃。梅雨明けが近づき、蝉が鳴き始めます。' },
    { name: '大暑', date: new Date('2025-07-22T22:29:00'), season: 'summer', description: '一年で最も暑さが厳しい時期。夏の土用の時期でもあります。' },
    { name: '立秋', date: new Date('2025-08-07T14:52:00'), season: 'autumn', description: '暦の上での秋の始まり。まだ暑いですが、朝夕は涼しくなり始めます。' },
    { name: '処暑', date: new Date('2025-08-23T05:34:00'), season: 'autumn', description: '暑さが和らぐ頃。朝晩の涼しさに秋の気配を感じ始めます。' },
    { name: '白露', date: new Date('2025-09-07T17:52:00'), season: 'autumn', description: '草花に朝露が宿り始める頃。日中は暖かくても朝晩は冷え込みます。' },
    { name: '秋分', date: new Date('2025-09-23T03:19:00'), season: 'autumn', description: '昼と夜の長さがほぼ等しくなる日。秋彼岸の中日でもあります。' },
    { name: '寒露', date: new Date('2025-10-08T09:41:00'), season: 'autumn', description: '露が冷たく感じられる頃。秋が深まり、紅葉が美しくなります。' },
    { name: '霜降', date: new Date('2025-10-23T12:51:00'), season: 'autumn', description: '露が霜に変わり始める頃。朝晩の冷え込みが厳しくなります。' },
    { name: '立冬', date: new Date('2025-11-07T13:04:00'), season: 'winter', description: '暦の上での冬の始まり。日差しが弱まり、冬の気配を感じ始めます。' },
    { name: '小雪', date: new Date('2025-11-22T10:36:00'), season: 'winter', description: '雪が降り始める頃。まだ積もるほどではない、わずかな雪を指します。' },
    { name: '大雪', date: new Date('2025-12-07T06:05:00'), season: 'winter', description: '本格的に雪が降り始める頃。山々は雪に覆われ、平地でも雪が降ります。' },
    { name: '冬至', date: new Date('2025-12-22T00:03:00'), season: 'winter', description: '一年で最も昼が短く夜が長い日。ゆず湯に入り、かぼちゃを食べる風習があります。' }
  ],
  2026: [
    { name: '小寒', date: new Date('2026-01-05T17:24:00'), season: 'winter', description: '寒さが最も厳しくなる前の時期。この日から寒の入りとなります。' },
    { name: '大寒', date: new Date('2026-01-20T10:46:00'), season: 'winter', description: '一年で最も寒さが厳しい時期。寒稽古など、寒さを利用した行事が行われます。' },
    { name: '立春', date: new Date('2026-02-04T05:03:00'), season: 'spring', description: '暦の上での春の始まり。梅の花が咲き始め、徐々に暖かくなり始めます。' },
    { name: '雨水', date: new Date('2026-02-19T00:51:00'), season: 'spring', description: '雪が雨に変わり、積もった雪が溶け始める頃。農耕の準備を始める目安です。' },
    { name: '啓蟄', date: new Date('2026-03-05T22:58:00'), season: 'spring', description: '冬ごもりしていた虫が、春の暖かさを感じて地中から姿を現す頃。' },
    { name: '春分', date: new Date('2026-03-20T23:41:00'), season: 'spring', description: '昼と夜の長さがほぼ等しくなる日。自然をたたえ生物をいつくしむ日です。' },
    { name: '清明', date: new Date('2026-04-05T03:35:00'), season: 'spring', description: '万物が清らかで明るく、生き生きとした様子を見せる頃。花見の季節です。' },
    { name: '穀雨', date: new Date('2026-04-20T10:31:00'), season: 'spring', description: '春の雨が降り、穀物の成長を助ける頃。種まきの好機とされています。' },
    { name: '立夏', date: new Date('2026-05-05T20:41:00'), season: 'summer', description: '暦の上での夏の始まり。新緑が美しく、過ごしやすい気候になります。' },
    { name: '小満', date: new Date('2026-05-21T09:28:00'), season: 'summer', description: '陽気が良くなり、万物が成長して天地に満ち始める頃。麦の穂が実り始めます。' },
    { name: '芒種', date: new Date('2026-06-06T00:40:00'), season: 'summer', description: '稲などの穀物の種をまく時期。梅雨入りの頃でもあります。' },
    { name: '夏至', date: new Date('2026-06-21T17:16:00'), season: 'summer', description: '一年で最も昼が長く夜が短い日。本格的な夏の到来を告げます。' },
    { name: '小暑', date: new Date('2026-07-07T10:50:00'), season: 'summer', description: '暑さが本格的になる頃。梅雨明けが近づき、蝉が鳴き始めます。' },
    { name: '大暑', date: new Date('2026-07-23T04:07:00'), season: 'summer', description: '一年で最も暑さが厳しい時期。夏の土用の時期でもあります。' },
    { name: '立秋', date: new Date('2026-08-07T20:38:00'), season: 'autumn', description: '暦の上での秋の始まり。まだ暑いですが、朝夕は涼しくなり始めます。' },
    { name: '処暑', date: new Date('2026-08-23T11:16:00'), season: 'autumn', description: '暑さが和らぐ頃。朝晩の涼しさに秋の気配を感じ始めます。' },
    { name: '白露', date: new Date('2026-09-07T23:41:00'), season: 'autumn', description: '草花に朝露が宿り始める頃。日中は暖かくても朝晩は冷え込みます。' },
    { name: '秋分', date: new Date('2026-09-23T09:04:00'), season: 'autumn', description: '昼と夜の長さがほぼ等しくなる日。秋彼岸の中日でもあります。' },
    { name: '寒露', date: new Date('2026-10-08T15:31:00'), season: 'autumn', description: '露が冷たく感じられる頃。秋が深まり、紅葉が美しくなります。' },
    { name: '霜降', date: new Date('2026-10-23T18:38:00'), season: 'autumn', description: '露が霜に変わり始める頃。朝晩の冷え込みが厳しくなります。' },
    { name: '立冬', date: new Date('2026-11-07T18:54:00'), season: 'winter', description: '暦の上での冬の始まり。日差しが弱まり、冬の気配を感じ始めます。' },
    { name: '小雪', date: new Date('2026-11-22T16:24:00'), season: 'winter', description: '雪が降り始める頃。まだ積もるほどではない、わずかな雪を指します。' },
    { name: '大雪', date: new Date('2026-12-07T11:55:00'), season: 'winter', description: '本格的に雪が降り始める頃。山々は雪に覆われ、平地でも雪が降ります。' },
    { name: '冬至', date: new Date('2026-12-22T05:53:00'), season: 'winter', description: '一年で最も昼が短く夜が長い日。ゆず湯に入り、かぼちゃを食べる風習があります。' }
  ]
};

// 現在の節気を取得
export function getCurrentSekki(date: Date = new Date()): SekkiInfo | null {
  const year = date.getFullYear();
  const yearData = sekkiData[year];

  if (!yearData) return null;

  // 日付を降順でソートして、現在日付より前で最も近い節気を見つける
  const sortedSekki = [...yearData].sort((a, b) => b.date.getTime() - a.date.getTime());

  for (const sekki of sortedSekki) {
    if (date >= sekki.date) {
      return sekki;
    }
  }

  // 年の最初の節気より前の場合、前年の最後の節気を返す
  const prevYearData = sekkiData[year - 1];
  if (prevYearData) {
    return prevYearData[prevYearData.length - 1];
  }

  return null;
}

// 次の節気を取得
export function getNextSekki(date: Date = new Date()): SekkiInfo | null {
  const year = date.getFullYear();
  const yearData = sekkiData[year];
  const nextYearData = sekkiData[year + 1];

  if (!yearData) return null;

  // 今年の節気から次の節気を探す
  for (const sekki of yearData) {
    if (date < sekki.date) {
      return sekki;
    }
  }

  // 今年の節気がすべて過ぎていたら、来年の最初の節気を返す
  if (nextYearData) {
    return nextYearData[0];
  }

  return null;
}

// 次の節気までの日数を計算
export function getDaysUntilNextSekki(date: Date = new Date()): number | null {
  const nextSekki = getNextSekki(date);
  if (!nextSekki) return null;

  const diffTime = nextSekki.date.getTime() - date.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// 節気名からCSSクラス名を取得
export function getSekkiClassName(sekkiName: string): string {
  return `bg-${sekkiName}`;
}
