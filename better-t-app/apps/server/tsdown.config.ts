import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  deps: {
    // ワークスペースパッケージのみバンドル（他の依存はexternal扱い）
    onlyBundle: [/@better-t-app\/.*/],
  },
});
