import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { orpc } from "@/utils/orpc";
import { MOOD_COLORS, MOOD_LABELS, WEATHER_LABELS } from "@/utils/diary";

const searchSchema = z.object({
  page: z.number().int().min(1).default(1),
});

export const Route = createFileRoute("/public/")({
  component: PublicDiaryListPage,
  validateSearch: searchSchema,
});

function PublicDiaryListPage() {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();

  const { data, isLoading } = useQuery(
    orpc.diary.listPublic.queryOptions({ input: { page, limit: 20 } }),
  );

  const totalPages = data ? Math.ceil(data.total / 20) : 1;

  const handlePageChange = (newPage: number) => {
    navigate({ to: ".", search: { page: newPage } });
  };

  return (
    <div className="mx-auto max-w-2xl w-full px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Manrope" }}>
          みんなの日記
        </h1>
        <p
          className="mt-0.5 text-sm text-muted-foreground"
          style={{ fontFamily: "Newsreader", fontStyle: "italic" }}
        >
          {data?.total ?? 0}件の公開日記
        </p>
      </div>

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <p>公開されている日記はまだありません。</p>
        </div>
      )}

      {!isLoading && data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((item) => (
            <Link
              key={item.id}
              to="/public/$id"
              params={{ id: item.id }}
              className="group block no-underline"
            >
              <div className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md dark:ring-white/8">
                {/* 著者情報 */}
                <div className="mb-3 flex items-center gap-2">
                  {item.author.image ? (
                    <img
                      src={item.author.image}
                      alt={item.author.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                      {item.author.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm text-muted-foreground" style={{ fontFamily: "Manrope" }}>{item.author.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground" style={{ fontFamily: "Manrope" }}>{item.date}</span>
                  {item.weather && <span className="text-xs">{WEATHER_LABELS[item.weather]}</span>}
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

      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 transition-colors"
            style={{ fontFamily: "Manrope" }}
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            前へ
          </button>
          <span className="text-sm text-muted-foreground" style={{ fontFamily: "Manrope" }}>
            {page} / {totalPages}
          </span>
          <button
            type="button"
            className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50 transition-colors"
            style={{ fontFamily: "Manrope" }}
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
