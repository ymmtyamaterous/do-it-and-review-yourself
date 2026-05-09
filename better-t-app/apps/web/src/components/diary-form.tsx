import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { Checkbox } from "@better-t-app/ui/components/checkbox";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import { z } from "zod";

const weatherOptions = [
  { value: "sunny", label: "☀️ 晴れ" },
  { value: "cloudy", label: "☁️ 曇り" },
  { value: "rainy", label: "🌧️ 雨" },
  { value: "snowy", label: "❄️ 雪" },
  { value: "other", label: "🌈 その他" },
] as const;

const moodOptions = [
  { value: "great", label: "😄 とても良い" },
  { value: "good", label: "😊 良い" },
  { value: "neutral", label: "😐 普通" },
  { value: "bad", label: "😟 悪い" },
  { value: "terrible", label: "😢 とても悪い" },
] as const;

export type DiaryFormValues = {
  date: string;
  title: string;
  weather: string;
  events: string;
  mood: string;
  goodThings: string;
  reflections: string;
  gratitude: string;
  tomorrowGoals: string;
  tomorrowJoys: string;
  learnings: string;
  todayInOneWord: string;
  freeText: string;
  isPublic: boolean;
};

type HabitCheckItem = { id: string; label: string; order: number };
type HabitCheck = { label: string; checked: boolean };

type VisibleFields = {
  events: boolean;
  mood: boolean;
  goodThings: boolean;
  reflections: boolean;
  gratitude: boolean;
  tomorrowGoals: boolean;
  tomorrowJoys: boolean;
  learnings: boolean;
  habitChecks: boolean;
  todayInOneWord: boolean;
};

type Props = {
  defaultValues?: Partial<DiaryFormValues>;
  defaultHabitChecks?: HabitCheck[];
  habitCheckItems?: HabitCheckItem[];
  visibleFields?: VisibleFields;
  onSubmit: (values: DiaryFormValues, habitChecks: HabitCheck[]) => Promise<void>;
  submitLabel: string;
};

const defaultVisible: VisibleFields = {
  events: true,
  mood: true,
  goodThings: true,
  reflections: true,
  gratitude: true,
  tomorrowGoals: true,
  tomorrowJoys: true,
  learnings: true,
  habitChecks: true,
  todayInOneWord: true,
};

export function DiaryForm({
  defaultValues,
  defaultHabitChecks = [],
  habitCheckItems = [],
  visibleFields = defaultVisible,
  onSubmit,
  submitLabel,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);

  // 習慣チェックの checked 状態を管理
  const [habitCheckedMap, setHabitCheckedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const item of habitCheckItems) {
      const existing = defaultHabitChecks.find((h) => h.label === item.label);
      map[item.id] = existing?.checked ?? false;
    }
    return map;
  });

  const toggleHabitCheck = (id: string) => {
    setHabitCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const form = useForm({
    defaultValues: {
      date: defaultValues?.date ?? today,
      title: defaultValues?.title ?? "",
      weather: defaultValues?.weather ?? "",
      events: defaultValues?.events ?? "",
      mood: defaultValues?.mood ?? "",
      goodThings: defaultValues?.goodThings ?? "",
      reflections: defaultValues?.reflections ?? "",
      gratitude: defaultValues?.gratitude ?? "",
      tomorrowGoals: defaultValues?.tomorrowGoals ?? "",
      tomorrowJoys: defaultValues?.tomorrowJoys ?? "",
      learnings: defaultValues?.learnings ?? "",
      todayInOneWord: defaultValues?.todayInOneWord ?? "",
      freeText: defaultValues?.freeText ?? "",
      isPublic: defaultValues?.isPublic ?? false,
    } satisfies DiaryFormValues,
    validators: {
      onSubmit: ({ value }) => {
        if (!value.date) return { fields: { date: "日付を入力してください" } };
        if (!value.title) return { fields: { title: "タイトルを入力してください" } };
        if (value.title.length > 100) return { fields: { title: "タイトルは100文字以内です" } };
        if (value.todayInOneWord && value.todayInOneWord.length > 100) return { fields: { todayInOneWord: "100文字以内です" } };
        return undefined;
      },
    },
    onSubmit: async ({ value }) => {
      const checks: HabitCheck[] = habitCheckItems.map((item) => ({
        label: item.label,
        checked: habitCheckedMap[item.id] ?? false,
      }));
      await onSubmit(value, checks);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      {/* 基本情報カード */}
      <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/8 space-y-5">
      {/* 日付・天気 */}
      <div className="flex gap-4">
        <form.Field name="date">
          {(field) => (
            <div className="flex-1 space-y-1.5">
              <Label htmlFor={field.name} className="text-sm font-medium" style={{ fontFamily: "Manrope" }}>日付 *</Label>
              <Input
                id={field.name}
                type="date"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((e) => (
                <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
              ))}
            </div>
          )}
        </form.Field>

        <form.Field name="weather">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium" style={{ fontFamily: "Manrope" }}>天気</Label>
              <div className="flex flex-wrap gap-2">
                {weatherOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.handleChange(field.state.value === opt.value ? "" : opt.value)}
                    className={`rounded-full border px-3 py-1 text-sm transition-all ${
                      field.state.value === opt.value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:bg-muted"
                    }`}
                    style={{ fontFamily: "Manrope" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form.Field>
      </div>

      {/* タイトル */}
      <form.Field name="title">
        {(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="text-sm font-medium" style={{ fontFamily: "Manrope" }}>タイトル *</Label>
            <Input
              id={field.name}
              placeholder="今日のタイトル"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {field.state.meta.errors.map((e) => (
              <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
            ))}
          </div>
        )}
      </form.Field>

      {/* 感情 */}
      {visibleFields.mood && (
        <form.Field name="mood">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="text-sm font-medium" style={{ fontFamily: "Manrope" }}>感情</Label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.handleChange(field.state.value === opt.value ? "" : opt.value)}
                    className={`rounded-full border px-3 py-1 text-sm transition-all ${
                      field.state.value === opt.value
                        ? "border-primary bg-primary/10 text-primary font-medium"
                        : "border-border hover:bg-muted"
                    }`}
                    style={{ fontFamily: "Manrope" }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form.Field>
      )}
      </div>  {/* 基本情報カードここまで */}

      {/* テキストエリア項目群 */}
      {(
        [
          { name: "events" as const, label: "出来事", show: visibleFields.events },
          { name: "goodThings" as const, label: "良かったこと", show: visibleFields.goodThings },
          { name: "reflections" as const, label: "反省点", show: visibleFields.reflections },
          { name: "gratitude" as const, label: "感謝したこと", show: visibleFields.gratitude },
          { name: "tomorrowGoals" as const, label: "明日の目標", show: visibleFields.tomorrowGoals },
          { name: "tomorrowJoys" as const, label: "明日の楽しみ", show: visibleFields.tomorrowJoys },
          { name: "learnings" as const, label: "学んだこと・気づき", show: visibleFields.learnings },
        ] as const
      ).map(({ name, label, show }) =>
        show ? (
          <div key={name} className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
          <form.Field name={name}>
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>{label}</Label>
                <textarea
                  id={field.name}
                  rows={3}
                  placeholder={`${label}を書いてみましょう...`}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-xl border-0 bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:bg-background resize-y transition-colors"
                  style={{ fontFamily: "Newsreader", fontSize: "16px", lineHeight: "26px" }}
                />
              </div>
            )}
          </form.Field>
          </div>
        ) : null,
      )}

      {/* 今日を一言で */}
      {visibleFields.todayInOneWord && (
        <div className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
        <form.Field name="todayInOneWord">
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>今日を一言で</Label>
              <Input
                id={field.name}
                placeholder="例: 充実した一日だった"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors.map((e) => (
                <p key={String(e)} className="text-xs text-destructive">{String(e)}</p>
              ))}
            </div>
          )}
        </form.Field>
        </div>
      )}

      {/* 健康・習慣チェック */}
      {visibleFields.habitChecks && habitCheckItems.length > 0 && (
        <div className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>
            健康・習慣チェック
          </Label>
          <ul className="mt-3 space-y-2">
            {habitCheckItems.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <Checkbox
                  id={`habit-${item.id}`}
                  checked={habitCheckedMap[item.id] ?? false}
                  onCheckedChange={() => toggleHabitCheck(item.id)}
                />
                <label
                  htmlFor={`habit-${item.id}`}
                  className="text-sm cursor-pointer select-none"
                  style={{ fontFamily: "Manrope" }}
                >
                  {item.label}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 自由記述欄 */}
      <div className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
      <form.Field name="freeText">
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>自由記述欄</Label>
            <textarea
              id={field.name}
              rows={4}
              placeholder="何でも自由に書いてみましょう..."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="w-full rounded-xl border-0 bg-muted/50 px-4 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:bg-background resize-y transition-colors"
              style={{ fontFamily: "Newsreader", fontSize: "16px", lineHeight: "26px" }}
            />
          </div>
        )}
      </form.Field>
      </div>

      {/* 公開設定 */}
      <div className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
      <form.Field name="isPublic">
        {(field) => (
          <div className="flex items-center gap-3">
            <Checkbox
              id={field.name}
              checked={field.state.value}
              onCheckedChange={(checked) => field.handleChange(checked === true)}
            />
            <div>
              <Label htmlFor={field.name} className="text-sm font-medium cursor-pointer" style={{ fontFamily: "Manrope" }}>みんなの日記として公開する</Label>
              <p className="text-xs text-muted-foreground mt-0.5">公開すると「みんなの日記」ページで表示されます</p>
            </div>
          </div>
        )}
      </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
      >
        {({ canSubmit, isSubmitting }) => (
          <Button type="submit" className="w-full" disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "保存中..." : submitLabel}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
