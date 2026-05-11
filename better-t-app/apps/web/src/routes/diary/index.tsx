import { Button } from "@better-t-app/ui/components/button";
import { Input } from "@better-t-app/ui/components/input";
import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarDays, Globe, LayoutList, Lock, Plus, Search } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";
import { DiaryCalendar } from "@/components/diary-calendar";
import { orpc } from "@/utils/orpc";
import { MOOD_COLORS, MOOD_LABELS, WEATHER_LABELS } from "@/utils/diary";

const searchSchema = z.object({
  page: z.number().int().min(1).default(1),
  keyword: z.string().optional(),
});

export const Route = createFileRoute("/diary/")({
  component: DiaryListPage,
  validateSearch: searchSchema,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      redirect({ to: "/login", throw: true });
    }
    return { session };
  },
});

function DiaryListPage() {
  const { page, keyword } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [inputKeyword, setInputKeyword] = useState(keyword ?? "");
  const [view, setView] = useState<"list" | "calendar">("list");

  const { data, isLoading } = useQuery(
    orpc.diary.list.queryOptions({ input: { page, limit: 20, keyword } }),
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ search: { page: 1, keyword: inputKeyword || undefined } });
  };

  const handlePageChange = (newPage: number) => {
    navigate({ search: { page: newPage, keyword } });
  };

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      {/* Page header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Manrope" }}>
            わたしの日記
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground" style={{ fontFamily: "Newsreader", fontStyle: "italic" }}>
            {data?.total ?? 0}件の記録
          </p>
        </div>
        <Button render={<Link to="/diary/new" />}>
          <Plus className="h-4 w-4" />
          新しい日記
        </Button>
      </div>

      {/* View toggle */}
      <div className="mb-6 flex gap-1 rounded-lg bg-muted p-1 w-fit">
        <button
          type="button"
          onClick={() => setView("list")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutList className="h-4 w-4" />
          リスト
        </button>
        <button
          type="button"
          onClick={() => setView("calendar")}
          className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            view === "calendar" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          カレンダー
        </button>
      </div>

      {/* Calendar view */}
      {view === "calendar" && <DiaryCalendar />}

      {/* List view */}
      {view === "list" && (
        <>
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="タイトルや本文で検索..."
                value={inputKeyword}
                onChange={(e) => setInputKeyword(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">検索</Button>
          </form>

          {/* Loading */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && data?.items.length === 0 && (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                <Plus className="h-7 w-7 text-primary" />
              </div>
              <p className="text-base font-medium text-foreground" style={{ fontFamily: "Manrope" }}>まだ日記がありません</p>
              <p className="mt-1 text-sm text-muted-foreground">最初の一ページを書いてみましょう。</p>
              <Button render={<Link to="/diary/new" />} className="mt-6">最初の日記を書く</Button>
            </div>
          )}

          {/* List */}
          {!isLoading && data && data.items.length > 0 && (
            <div className="space-y-3">
              {data.items.map((item) => (
                <Link
                  key={item.id}
                  to="/diary/$id"
                  params={{ id: item.id }}
                  className="group block no-underline"
                >
                  <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md dark:ring-white/8">
                    <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                      <span style={{ fontFamily: "Manrope" }}>{item.date}</span>
                      {item.weather && <span>{WEATHER_LABELS[item.weather]}</span>}
                      <span className="ml-auto">
                        {item.isPublic ? (
                          <Globe className="h-3.5 w-3.5" />
                        ) : (
                          <Lock className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </div>
                    <h2
                      className="text-base font-semibold text-foreground group-hover:text-primary transition-colors"
                      style={{ fontFamily: "Manrope" }}
                    >
                      {item.title}
                    </h2>
                    {item.todayInOneWord && (
                      <p
                        className="mt-1.5 line-clamp-1 text-sm text-muted-foreground"
                        style={{ fontFamily: "Newsreader", fontStyle: "italic" }}
                      >
                        「{item.todayInOneWord}」
                      </p>
                    )}
                    {item.mood && (
                      <span
                        className={`mt-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${MOOD_COLORS[item.mood]}`}
                      >
                        {MOOD_LABELS[item.mood]}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-3">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => handlePageChange(page - 1)}>
                前へ
              </Button>
              <span className="text-sm text-muted-foreground" style={{ fontFamily: "Manrope" }}>
                {page} / {totalPages}
              </span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => handlePageChange(page + 1)}>
                次へ
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
