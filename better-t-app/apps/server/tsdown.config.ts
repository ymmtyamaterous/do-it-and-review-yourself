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
  // node_modules のパッケージをすべてバンドル対象にする
  // ネイティブ binary を持つ libsql 関連のみ external として残す
  noExternal: [/.*/],
  external: ["libsql", /^@libsql\/linux-/, /^@neon-rs\//, "detect-libc"],
});
