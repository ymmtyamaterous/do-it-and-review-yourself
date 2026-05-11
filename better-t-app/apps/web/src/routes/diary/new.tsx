import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";
import { DiaryForm } from "@/components/diary-form";
import type { DiaryFormValues, FieldVisibility } from "@/components/diary-form";

export const Route = createFileRoute("/diary/new")({
  component: DiaryNewPage,
  validateSearch: (search: Record<string, unknown>) => ({
    date: typeof search.date === "string" ? search.date : undefined,
  }),
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
  },
});

function DiaryNewPage() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { date: initialDate } = Route.useSearch();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery(orpc.userSettings.get.queryOptions());

  const createMutation = useMutation(orpc.diary.create.mutationOptions());

  const handleSubmit = async (values: DiaryFormValues, habitChecks: { label: string; checked: boolean }[], fieldVisibility: FieldVisibility, pendingFiles: File[]) => {
    try {
      const created = await createMutation.mutateAsync({
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
        await fetch(`/api/diary/${created.id}/media`, { method: "POST", body: formData });
      }

      await queryClient.invalidateQueries({ queryKey: orpc.diary.list.queryOptions({ input: { page: 1 } }).queryKey });
      toast.success("日記を保存しました");
      navigate({ to: "/diary" });
    } catch {
      toast.error("保存に失敗しました");
    }
  };

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Link
          to="/diary"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          戻る
        </Link>
        <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: "Manrope" }}>
          新しい日記
        </h1>
      </div>

      <DiaryForm
        visibleFields={settings?.visibleFields}
        habitCheckItems={settings?.habitCheckItems}
        onSubmit={handleSubmit}
        submitLabel="保存する"
        defaultValues={initialDate ? { date: initialDate } : undefined}
      />
    </div>
  );
}
