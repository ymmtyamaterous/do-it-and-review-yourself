import { Button } from "@better-t-app/ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { CalendarDays, ChevronLeft, Globe, Heart, Lightbulb, Lock, Pencil, PencilLine, RefreshCcw, Smile, Star, Target, Trash2 } from "lucide-react";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { MOOD_COLORS, MOOD_LABELS, WEATHER_LABELS } from "@/utils/diary";

export const Route = createFileRoute("/diary/$id")({
  component: DiaryDetailPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

function DiaryDetailPage() {
  const { id } = Route.useParams();
  const { session } = Route.useRouteContext();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data, isLoading, isError } = useQuery(
    orpc.diary.getById.queryOptions({ input: { id } }),
  );

  const { data: mediaList } = useQuery({
    ...orpc.diary.getMedia.queryOptions({ input: { diaryId: id } }),
    enabled: !!session.data,
  });

  const deleteMutation = useMutation(orpc.diary.delete.mutationOptions());

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    try {
      await deleteMutation.mutateAsync({ id });
      await queryClient.invalidateQueries({ queryKey: orpc.diary.list.queryOptions({ input: { page: 1 } }).queryKey });
      toast.success("日記を削除しました");
      navigate({ to: "/diary" });
    } catch {
      toast.error("削除に失敗しました");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 w-full">
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-10 w-full text-center">
        <p className="text-muted-foreground">日記が見つかりませんでした。</p>
        <Button render={<Link to="/diary" />} className="mt-4" variant="outline">一覧に戻る</Button>
      </div>
    );
  }

  const isOwner = data.userId === session.data?.user.id;
  const habitChecks = data.habitChecks as { label: string; checked: boolean }[] | null;
  const fv = data.fieldVisibility as Record<string, boolean> | null;

  const VisibilityBadge = ({ fvKey }: { fvKey: string }) => {
    if (!data.isPublic || fv === null) return null;
    return fv[fvKey] !== false ? (
      <span className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
        <Globe className="h-2.5 w-2.5" />公開
      </span>
    ) : (
      <span className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        <Lock className="h-2.5 w-2.5" />非公開
      </span>
    );
  };

  const FullSection = ({ icon, label, value, fvKey }: { icon: ReactNode; label: string; value: string; fvKey: string }) => (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>{label}</h3>
        <VisibilityBadge fvKey={fvKey} />
      </div>
      <p className="whitespace-pre-wrap text-foreground" style={{ fontFamily: "Newsreader", fontSize: "16px", lineHeight: "28px" }}>
        {value}
      </p>
    </div>
  );

  const CardSection = ({ icon, label, value, fvKey }: { icon: ReactNode; label: string; value: string; fvKey: string }) => (
    <div className="rounded-xl border border-border bg-muted/30 p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-muted-foreground">{icon}</span>
        <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>{label}</h3>
        <VisibilityBadge fvKey={fvKey} />
      </div>
      <p className="whitespace-pre-wrap text-sm text-foreground" style={{ fontFamily: "Newsreader", lineHeight: "24px" }}>
        {value}
      </p>
    </div>
  );

  return (
    <div className="mx-auto max-w-3xl w-full px-6 py-10">
      {/* ナビ */}
      <div className="mb-8 flex items-center justify-between">
        <Link
          to="/diary"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          一覧へ戻る
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            <Button render={<Link to="/diary/$id/edit" params={{ id }} />} variant="outline" size="sm">
              <Pencil className="h-3.5 w-3.5" />
              編集
            </Button>
            <Button
              variant={confirmDelete ? "destructive" : "outline"}
              size="sm"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {confirmDelete ? "本当に削除" : "削除"}
            </Button>
          </div>
        )}
      </div>

      {/* Journaling card */}
      <div className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
        {/* メタ情報 */}
        <div className="mb-5 flex items-center gap-3 text-xs text-muted-foreground" style={{ fontFamily: "Manrope" }}>
          <span>{data.date}</span>
          {data.weather && <span>{WEATHER_LABELS[data.weather]}</span>}
          <span className="ml-auto flex items-center gap-1">
            {data.isPublic ? (
              <><Globe className="h-3.5 w-3.5" />公開</>
            ) : (
              <><Lock className="h-3.5 w-3.5" />非公開</>
            )}
          </span>
        </div>

        <h1
          className="text-3xl font-bold tracking-tight text-foreground"
          style={{ fontFamily: "Manrope", letterSpacing: "-0.01em" }}
        >
          {data.title}
        </h1>

        <div className="mt-4 flex flex-wrap gap-2">
          {data.mood && (
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${MOOD_COLORS[data.mood]}`}>
              {MOOD_LABELS[data.mood]}
            </span>
          )}
          {data.todayInOneWord && (
            <span
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              style={{ fontFamily: "Newsreader", fontStyle: "italic" }}
            >
              「{data.todayInOneWord}」
            </span>
          )}
        </div>

        {(data.events || data.goodThings || data.reflections || data.learnings || data.gratitude ||
          data.tomorrowGoals || data.tomorrowJoys || data.freeText ||
          (habitChecks && habitChecks.length > 0)) && (
          <hr className="my-7 border-border/60" />
        )}

        {/* 各セクション */}
        <div className="space-y-6">
          {/* 出来事 - 全幅 */}
          {data.events && (
            <FullSection icon={<CalendarDays className="h-4 w-4" />} label="出来事" value={data.events} fvKey="events" />
          )}

          {/* 良かったこと | 反省点 - 2カラム */}
          {(data.goodThings || data.reflections) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.goodThings && (
                <CardSection icon={<Star className="h-4 w-4" />} label="良かったこと" value={data.goodThings} fvKey="goodThings" />
              )}
              {data.reflections && (
                <CardSection icon={<RefreshCcw className="h-4 w-4" />} label="反省点" value={data.reflections} fvKey="reflections" />
              )}
            </div>
          )}

          {/* 学んだこと・気づき | 感謝したこと - 2カラム */}
          {(data.learnings || data.gratitude) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.learnings && (
                <CardSection icon={<Lightbulb className="h-4 w-4" />} label="学んだこと・気づき" value={data.learnings} fvKey="learnings" />
              )}
              {data.gratitude && (
                <CardSection icon={<Heart className="h-4 w-4" />} label="感謝したこと" value={data.gratitude} fvKey="gratitude" />
              )}
            </div>
          )}

          {/* 明日の目標 | 明日の楽しみ - 2カラム */}
          {(data.tomorrowGoals || data.tomorrowJoys) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.tomorrowGoals && (
                <CardSection icon={<Target className="h-4 w-4" />} label="明日の目標" value={data.tomorrowGoals} fvKey="tomorrowGoals" />
              )}
              {data.tomorrowJoys && (
                <CardSection icon={<Smile className="h-4 w-4" />} label="明日の楽しみ" value={data.tomorrowJoys} fvKey="tomorrowJoys" />
              )}
            </div>
          )}

          {/* 自由記述欄 - 全幅 */}
          {data.freeText && (
            <FullSection icon={<PencilLine className="h-4 w-4" />} label="自由記述欄" value={data.freeText} fvKey="freeText" />
          )}

          {/* 健康・習慣チェック - 全幅・横並び */}
          {habitChecks && habitChecks.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Heart className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>
                  健康・習慣チェック
                </h3>
                <VisibilityBadge fvKey="habitChecks" />
              </div>
              <div className="flex flex-wrap gap-3">
                {habitChecks.map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                      item.checked
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-muted/30 text-muted-foreground"
                    }`}
                    style={{ fontFamily: "Manrope" }}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded text-[10px] ${
                        item.checked ? "bg-primary text-primary-foreground" : "border border-border bg-background"
                      }`}
                    >
                      {item.checked ? "✓" : ""}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 添付メディア */}
          {mediaList && mediaList.length > 0 && (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Pencil className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-semibold text-foreground" style={{ fontFamily: "Manrope" }}>
                  添付ファイル
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {mediaList.map((media) =>
                  media.type === "image" ? (
                    <a key={media.id} href={media.url} target="_blank" rel="noreferrer">
                      <img
                        src={media.url}
                        alt={media.filename}
                        className="h-28 w-28 rounded-xl object-cover border border-border hover:opacity-90 transition-opacity"
                      />
                    </a>
                  ) : (
                    <div key={media.id} className="flex flex-col gap-1 rounded-xl border border-border bg-muted/30 p-3 min-w-40">
                      <span className="text-xs font-medium text-foreground truncate max-w-36" style={{ fontFamily: "Manrope" }}>
                        {media.filename}
                      </span>
                      <audio controls src={media.url} className="w-full h-8" />
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
