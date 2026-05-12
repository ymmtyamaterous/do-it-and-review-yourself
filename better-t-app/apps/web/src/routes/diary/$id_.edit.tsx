import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { env } from "@better-t-app/env/web";
import { orpc } from "@/utils/orpc";
import { DiaryForm } from "@/components/diary-form";
import type { DiaryFormValues, FieldVisibility } from "@/components/diary-form";

export const Route = createFileRoute("/diary/$id_/edit")({
  component: DiaryEditPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

function DiaryEditPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(orpc.diary.getById.queryOptions({ input: { id } }));
  const { data: settings } = useQuery(orpc.userSettings.get.queryOptions());

  const updateMutation = useMutation(orpc.diary.update.mutationOptions());

  const handleSubmit = async (values: DiaryFormValues, habitChecks: { label: string; checked: boolean }[], fieldVisibility: FieldVisibility, pendingFiles: File[]) => {
    try {
      await updateMutation.mutateAsync({
        id,
        date: values.date,
        title: values.title,
        weather: values.weather as "sunny" | "cloudy" | "rainy" | "snowy" | "other" | undefined || undefined,
        events: values.events || undefined,
        mood: values.mood as "great" | "good" | "neutral" | "bad" | "terrible" | undefined || undefined,
        goodThings: values.goodThings || undefined,
        reflections: values.reflections || undefined,
        gratitude: values.gratitude || undefined,
        tomorrowGoals: values.tomorrowGoals || undefined,
        tomorrowJoys: values.tomorrowJoys || undefined,
        learnings: values.learnings || undefined,
        habitChecks: habitChecks.length > 0 ? habitChecks : undefined,
        todayInOneWord: values.todayInOneWord || undefined,
        freeText: values.freeText || undefined,
        isPublic: values.isPublic,
        fieldVisibility,
      });

      // ファイルアップロード
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch(`${env.VITE_SERVER_URL}/api/diary/${id}/media`, { method: "POST", body: formData, credentials: "include" });
      }

      await queryClient.invalidateQueries({ queryKey: orpc.diary.getById.queryOptions({ input: { id } }).queryKey });
      await queryClient.invalidateQueries({ queryKey: orpc.diary.list.queryOptions({ input: { page: 1 } }).queryKey });
      toast.success("日記を更新しました");
      navigate({ to: "/diary/$id", params: { id } });
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

  if (!data) return null;

  const habitChecks = data.habitChecks as { label: string; checked: boolean }[] | null;
  const fieldVisibility = data.fieldVisibility as {
    events?: boolean; goodThings?: boolean; reflections?: boolean; gratitude?: boolean;
    tomorrowGoals?: boolean; tomorrowJoys?: boolean; learnings?: boolean;
    habitChecks?: boolean; todayInOneWord?: boolean; freeText?: boolean;
  } | null;

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link
          to="/diary/$id"
          params={{ id }}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          詳細に戻る
        </Link>
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Manrope" }}>
          日記を編集
        </h1>
      </div>

      <DiaryForm
        defaultValues={{
          date: data.date,
          title: data.title,
          weather: data.weather ?? "",
          events: data.events ?? "",
          mood: data.mood ?? "",
          goodThings: data.goodThings ?? "",
          reflections: data.reflections ?? "",
          gratitude: data.gratitude ?? "",
          tomorrowGoals: data.tomorrowGoals ?? "",
          tomorrowJoys: data.tomorrowJoys ?? "",
          learnings: data.learnings ?? "",
          todayInOneWord: data.todayInOneWord ?? "",
          freeText: data.freeText ?? "",
          isPublic: data.isPublic,
        }}
        defaultHabitChecks={habitChecks ?? []}
        visibleFields={settings?.visibleFields}
        habitCheckItems={settings?.habitCheckItems}
        defaultFieldVisibility={fieldVisibility ?? undefined}
        onSubmit={handleSubmit}
        submitLabel="更新する"
      />
    </div>
  );
}
