export type PaginationItem = number | "ellipsis";

/**
 * 先頭・末尾・現在ページの前後を表示するページネーション項目を作成する。
 */
export function getPaginationItems(page: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 0) return [];

  const visiblePages = new Set([
    1,
    totalPages,
    page - 1,
    page,
    page + 1,
  ]);
  const pages = [...visiblePages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b);

  return pages.flatMap((item, index) => {
    const previous = pages[index - 1];
    return previous !== undefined && item - previous > 1 ? ["ellipsis", item] : [item];
  });
}
