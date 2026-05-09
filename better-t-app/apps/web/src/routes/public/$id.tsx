import { Button } from "@better-t-app/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";

import { orpc } from "@/utils/orpc";
import { MOOD_COLORS, MOOD_LABELS, WEATHER_LABELS } from "@/utils/diary";

export const Route = createFileRoute("/public/$id")({
  component: PublicDiaryDetailPage,
});

function PublicDiaryDetailPage() {
  const { id } = Route.useParams();

  const { data, isLoading, isError } = useQuery(
    orpc.diary.getPublicById.queryOptions({ input: { id } }),
  );

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
        <Button render={<Link to="/public" />} className="mt-4" variant="outline">一覧に戻る</Button>
      </div>
    );
  }

  const habitChecks = data.habitChecks as { label: string; checked: boolean }[] | null;

  const sections = [
    { label: "出来事", value: data.events },
    { label: "良かったこと", value: data.goodThings },
    { label: "反省点", value: data.reflections },
    { label: "感謝したこと", value: data.gratitude },
    { label: "明日の目標", value: data.tomorrowGoals },
    { label: "明日の楽しみ", value: data.tomorrowJoys },
    { label: "学んだこと・気づき", value: data.learnings },
    { label: "自由記述欄", value: data.freeText },
  ];

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <div className="mb-8">
        <Link
          to="/public"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          みんなの日記に戻る
        </Link>
      </div>

      <div className="rounded-2xl bg-card p-8 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
        {/* 著者情報 */}
        <div className="mb-5 flex items-center gap-3">
          {data.author.image ? (
            <img
              src={data.author.image}
              alt={data.author.name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
              {data.author.name.charAt(0)}
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-foreground" style={{ fontFamily: "Manrope" }}>{data.author.name}</p>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "Manrope" }}>
              {data.date}{data.weather && <> · {WEATHER_LABELS[data.weather]}</>}
            </p>
          </div>
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

        {sections.some(s => s.value) && <hr className="my-7 border-border/60" />}

        <div className="space-y-7">
          {sections.map(({ label, value }) =>
            value ? (
              <div key={label}>
                <h3
                  className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  style={{ fontFamily: "Manrope" }}
                >
                  {label}
                </h3>
                <p
                  className="whitespace-pre-wrap text-foreground"
                  style={{ fontFamily: "Newsreader", fontSize: "16px", lineHeight: "28px" }}
                >
                  {value}
                </p>
              </div>
            ) : null,
          )}

          {habitChecks && habitChecks.length > 0 && (
            <div>
              <h3
                className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                style={{ fontFamily: "Manrope" }}
              >
                健康・習慣チェック
              </h3>
              <ul className="space-y-2">
                {habitChecks.map((item) => (
                  <li key={item.label} className="flex items-center gap-3">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-md text-xs ${
                        item.checked ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.checked ? "✓" : ""}
                    </span>
                    <span
                      className={`text-sm ${item.checked ? "text-foreground" : "text-muted-foreground line-through"}`}
                      style={{ fontFamily: "Manrope" }}
                    >
                      {item.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
