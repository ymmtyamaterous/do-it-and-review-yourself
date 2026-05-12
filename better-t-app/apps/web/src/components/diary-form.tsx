import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { Checkbox } from "@better-t-app/ui/components/checkbox";
import { useForm } from "@tanstack/react-form";
import { useEffect, useRef, useState } from "react";
import { Globe, Lock, Music, Paperclip, X } from "lucide-react";
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

export type FieldVisibility = {
  events: boolean;
  goodThings: boolean;
  reflections: boolean;
  gratitude: boolean;
  tomorrowGoals: boolean;
  tomorrowJoys: boolean;
  learnings: boolean;
  habitChecks: boolean;
  todayInOneWord: boolean;
  freeText: boolean;
};

type Props = {
  defaultValues?: Partial<DiaryFormValues>;
  defaultHabitChecks?: HabitCheck[];
  habitCheckItems?: HabitCheckItem[];
  visibleFields?: VisibleFields;
  defaultFieldVisibility?: Partial<FieldVisibility>;
  onSubmit: (values: DiaryFormValues, habitChecks: HabitCheck[], fieldVisibility: FieldVisibility, pendingFiles: File[]) => Promise<void>;
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

const allPublic: FieldVisibility = {
  events: true,
  goodThings: true,
  reflections: true,
  gratitude: true,
  tomorrowGoals: true,
  tomorrowJoys: true,
  learnings: true,
  habitChecks: true,
  todayInOneWord: true,
  freeText: true,
};

function FieldVisibilityToggle({
  isPublic,
  onToggle,
}: {
  isPublic: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={isPublic ? "公開中（クリックで非公開に）" : "非公開（クリックで公開に）"}
      className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${
        isPublic
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : "bg-muted text-muted-foreground hover:bg-muted/80"
      }`}
      style={{ fontFamily: "Manrope" }}
    >
      {isPublic ? (
        <><Globe className="h-3 w-3" />公開</>
      ) : (
        <><Lock className="h-3 w-3" />非公開</>
      )}
    </button>
  );
}

export function DiaryForm({
  defaultValues,
  defaultHabitChecks = [],
  habitCheckItems = [],
  visibleFields = defaultVisible,
  defaultFieldVisibility,
  onSubmit,
  submitLabel,
}: Props) {
  const today = new Date().toISOString().slice(0, 10);

  // 添付ファイル
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // object URL のクリーンアップ
  useEffect(() => {
    return () => {
      for (const url of previewUrls) {
        URL.revokeObjectURL(url);
      }
    };
  }, [previewUrls]);

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newUrls = files.map((f) => (f.type.startsWith("image/") ? URL.createObjectURL(f) : ""));
    setPendingFiles((prev) => [...prev, ...files]);
    setPreviewUrls((prev) => [...prev, ...newUrls]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    const url = previewUrls[index];
    if (url) URL.revokeObjectURL(url);
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 習慣チェックの checked 状態を管理
  const [habitCheckedMap, setHabitCheckedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const item of habitCheckItems) {
      const existing = defaultHabitChecks.find((h) => h.label === item.label);
      map[item.id] = existing?.checked ?? false;
    }
    return map;
  });

  // 項目別公開設定
  const [fieldVisibility, setFieldVisibility] = useState<FieldVisibility>(() => ({
    ...allPublic,
    ...defaultFieldVisibility,
  }));

  const toggleHabitCheck = (id: string) => {
    setHabitCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFieldVisibility = (key: keyof FieldVisibility) => {
    setFieldVisibility((prev) => ({ ...prev, [key]: !prev[key] }));
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
      await onSubmit(value, checks, fieldVisibility, pendingFiles);
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
          { name: "events" as const, label: "出来事", show: visibleFields.events, fvKey: "events" as keyof FieldVisibility },
          { name: "goodThings" as const, label: "良かったこと", show: visibleFields.goodThings, fvKey: "goodThings" as keyof FieldVisibility },
          { name: "reflections" as const, label: "反省点", show: visibleFields.reflections, fvKey: "reflections" as keyof FieldVisibility },
          { name: "gratitude" as const, label: "感謝したこと", show: visibleFields.gratitude, fvKey: "gratitude" as keyof FieldVisibility },
          { name: "tomorrowGoals" as const, label: "明日の目標", show: visibleFields.tomorrowGoals, fvKey: "tomorrowGoals" as keyof FieldVisibility },
          { name: "tomorrowJoys" as const, label: "明日の楽しみ", show: visibleFields.tomorrowJoys, fvKey: "tomorrowJoys" as keyof FieldVisibility },
          { name: "learnings" as const, label: "学んだこと・気づき", show: visibleFields.learnings, fvKey: "learnings" as keyof FieldVisibility },
        ] as const
      ).map(({ name, label, show, fvKey }) =>
        show ? (
          <div key={name} className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
          <form.Field name={name}>
            {(field) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>{label}</Label>
                  <FieldVisibilityToggle
                    isPublic={fieldVisibility[fvKey]}
                    onToggle={() => toggleFieldVisibility(fvKey)}
                  />
                </div>
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
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>今日を一言で</Label>
                <FieldVisibilityToggle
                  isPublic={fieldVisibility.todayInOneWord}
                  onToggle={() => toggleFieldVisibility("todayInOneWord")}
                />
              </div>
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
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>
              健康・習慣チェック
            </Label>
            <FieldVisibilityToggle
              isPublic={fieldVisibility.habitChecks}
              onToggle={() => toggleFieldVisibility("habitChecks")}
            />
          </div>
          <ul className="space-y-2">
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
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>自由記述欄</Label>
              <FieldVisibilityToggle
                isPublic={fieldVisibility.freeText}
                onToggle={() => toggleFieldVisibility("freeText")}
              />
            </div>
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

      {/* 画像・音声ファイル */}
      <div className="rounded-2xl bg-card px-6 py-5 shadow-sm ring-1 ring-black/5 dark:ring-white/8 space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "Manrope" }}>
            画像・音声ファイル
          </Label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            style={{ fontFamily: "Manrope" }}
          >
            <Paperclip className="h-3.5 w-3.5" />
            ファイルを追加
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp,audio/*"
            className="hidden"
            onChange={handleFileAdd}
          />
        </div>
        {pendingFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {pendingFiles.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="relative flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2"
              >
                {file.type.startsWith("image/") ? (
                  <img
                    src={previewUrls[i]}
                    alt={file.name}
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted">
                    <Music className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="max-w-24 flex flex-col">
                  <span className="truncate text-xs font-medium text-foreground" style={{ fontFamily: "Manrope" }}>
                    {file.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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
