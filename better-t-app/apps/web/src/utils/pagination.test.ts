import { describe, expect, it } from "bun:test";

import { getPaginationItems } from "./pagination";

describe("getPaginationItems", () => {
  it("ページ数が少ない場合はすべてのページを返す", () => {
    expect(getPaginationItems(2, 3)).toEqual([1, 2, 3]);
  });

  it("中間ページでは先頭と末尾の間を省略する", () => {
    expect(getPaginationItems(5, 10)).toEqual([1, "ellipsis", 4, 5, 6, "ellipsis", 10]);
  });

  it("先頭ページでは末尾側のみを省略する", () => {
    expect(getPaginationItems(1, 10)).toEqual([1, 2, "ellipsis", 10]);
  });

  it("ページが存在しない場合は空配列を返す", () => {
    expect(getPaginationItems(1, 0)).toEqual([]);
  });
});
