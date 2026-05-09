import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { Label } from "@better-t-app/ui/components/label";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Check, Plus, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

const FIELD_LABELS: Record<string, string> = {
  events: "出来事",
  mood: "感情",
  goodThings: "良かったこと",
  reflections: "反省点",
  gratitude: "感謝したこと",
  tomorrowGoals: "明日の目標",
  tomorrowJoys: "明日の楽しみ",
  learnings: "学んだこと・気づき",
  habitChecks: "健康・習慣チェック",
  todayInOneWord: "今日を一言で",
};

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

type HabitCheckItem = { id: string; label: string; order: number };

function SettingsPage() {
  const { session } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery(orpc.userSettings.get.queryOptions());

  const [visibleFields, setVisibleFields] = useState<VisibleFields | null>(null);
  const [habitItems, setHabitItems] = useState<HabitCheckItem[] | null>(null);
  const [newHabitLabel, setNewHabitLabel] = useState("");
  const [profileName, setProfileName] = useState("");
  const [profileImageDataUrl, setProfileImageDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  // 変更検知
  const settingsDirty = visibleFields !== null || habitItems !== null;

  const fields = visibleFields ?? settings?.visibleFields ?? ({} as VisibleFields);
  const items = habitItems ?? settings?.habitCheckItems ?? [];

  const updateSettingsMutation = useMutation(orpc.userSettings.update.mutationOptions());
  const updateProfileMutation = useMutation(orpc.profile.update.mutationOptions());

  const handleToggleField = (key: keyof VisibleFields) => {
    setVisibleFields((prev) => ({
      ...(prev ?? (settings?.visibleFields as VisibleFields)),
      [key]: !(prev ?? settings?.visibleFields)?.[key],
    }));
  };

  const handleSaveSettings = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        visibleFields: fields,
        habitCheckItems: items,
      });
      await queryClient.invalidateQueries({ queryKey: orpc.userSettings.get.queryOptions().queryKey });
      // 変更を保存済みとしてリセット
      setVisibleFields(null);
      setHabitItems(null);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 2500);
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  const handleAddHabitItem = () => {
    if (!newHabitLabel.trim()) return;
    const newItem: HabitCheckItem = {
      id: crypto.randomUUID(),
      label: newHabitLabel.trim(),
      order: items.length,
    };
    setHabitItems([...items, newItem]);
    setNewHabitLabel("");
  };

  const handleRemoveHabitItem = (id: string) => {
    setHabitItems(items.filter((item) => item.id !== id));
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ファイルサイズは5MB以下にしてください");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 256;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        } else {
          if (height > MAX) { width = Math.round(width * MAX / height); height = MAX; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);
        setProfileImageDataUrl(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfileMutation.mutateAsync({
        name: profileName || undefined,
        image: profileImageDataUrl || undefined,
      });
      // 変更をリセット
      setProfileName("");
      setProfileImageDataUrl(null);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      toast.error("更新に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 w-full">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Manrope" }}>
          設定
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">アカウントと日記の設定を管理します。</p>
      </div>

      {/* プロフィール */}
      <section className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-black/5 dark:ring-white/8 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>
            プロフィール
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">公開ページに表示される情報です。</p>
        </div>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium" style={{ fontFamily: "Manrope" }}>表示名</Label>
            <Input
              placeholder={session.data?.user.name ?? "表示名"}
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label className="text-sm font-medium" style={{ fontFamily: "Manrope" }}>アイコン画像</Label>
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-primary/15 flex items-center justify-center text-xl font-bold text-primary">
                {(profileImageDataUrl ?? session.data?.user.image) ? (
                  <img
                    src={profileImageDataUrl ?? session.data?.user.image ?? ""}
                    alt="アバター"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span>{session.data?.user.name?.charAt(0) ?? "?"}</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  画像を選択
                </Button>
                {profileImageDataUrl && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors text-left"
                    onClick={() => setProfileImageDataUrl(null)}
                  >
                    変更をキャンセル
                  </button>
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">JPEG・PNG・WebP・GIF対応。最大5MB。</p>
          </div>
        </div>
        <Button
          onClick={handleSaveProfile}
          disabled={updateProfileMutation.isPending || profileSaved || (!profileName && !profileImageDataUrl)}
          variant={profileSaved ? "outline" : "default"}
          className={profileSaved ? "text-primary border-primary/40" : ""}
        >
          {updateProfileMutation.isPending ? "保存中..." : profileSaved ? <><Check className="h-4 w-4" />保存しました</> : "保存する"}
        </Button>
      </section>

      {/* 表示項目設定 */}
      <section className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-black/5 dark:ring-white/8 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>
            日記の表示項目
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            日記作成・編集画面に表示する項目を選択してください。
          </p>
        </div>
        <div className="space-y-3">
          {(Object.keys(FIELD_LABELS) as (keyof VisibleFields)[]).map((key) => (
            <div key={key} className="flex items-center justify-between py-1">
              <span className="text-sm text-foreground" style={{ fontFamily: "Manrope" }}>{FIELD_LABELS[key]}</span>
              <button
                type="button"
                role="switch"
                aria-checked={fields[key]}
                onClick={() => handleToggleField(key)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  fields[key] ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    fields[key] ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending || settingsSaved || !settingsDirty}
          variant={settingsSaved ? "outline" : "default"}
          className={settingsSaved ? "text-primary border-primary/40" : ""}
        >
          {updateSettingsMutation.isPending ? "保存中..." : settingsSaved ? <><Check className="h-4 w-4" />保存しました</> : "保存する"}
        </Button>
      </section>

      {/* 健康・習慣チェック項目 */}
      <section className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-black/5 dark:ring-white/8 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>
            健康・習慣チェック項目
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            日記に表示するチェック項目を設定してください。
          </p>
        </div>

        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 rounded-xl bg-muted/60 px-4 py-2.5">
              <span className="flex-1 text-sm text-foreground" style={{ fontFamily: "Manrope" }}>{item.label}</span>
              <button
                type="button"
                onClick={() => handleRemoveHabitItem(item.id)}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="削除"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">まだ項目がありません。</p>
          )}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="新しい項目を追加..."
            value={newHabitLabel}
            onChange={(e) => setNewHabitLabel(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddHabitItem();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={handleAddHabitItem}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button
          onClick={handleSaveSettings}
          disabled={updateSettingsMutation.isPending || settingsSaved || !settingsDirty}
          variant={settingsSaved ? "outline" : "default"}
          className={settingsSaved ? "text-primary border-primary/40" : ""}
        >
          {updateSettingsMutation.isPending ? "保存中..." : settingsSaved ? <><Check className="h-4 w-4" />保存しました</> : "保存する"}
        </Button>
      </section>
    </div>
  );
}
