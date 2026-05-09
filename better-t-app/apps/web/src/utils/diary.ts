export const WEATHER_LABELS: Record<string, string> = {
  sunny: "☀️ 晴れ",
  cloudy: "☁️ 曇り",
  rainy: "🌧️ 雨",
  snowy: "❄️ 雪",
  other: "🌈 その他",
};

export const MOOD_LABELS: Record<string, string> = {
  great: "とても良い",
  good: "良い",
  neutral: "普通",
  bad: "悪い",
  terrible: "とても悪い",
};

export const MOOD_COLORS: Record<string, string> = {
  great: "bg-primary/20 text-primary",
  good: "bg-secondary/20 text-secondary-foreground",
  neutral: "bg-muted text-muted-foreground",
  bad: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  terrible: "bg-destructive/20 text-destructive",
};
