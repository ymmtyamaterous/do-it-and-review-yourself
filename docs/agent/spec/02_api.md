# API 設計書

## 1. 基本方針

- API 通信には **oRPC**（型安全 RPC）を使用する
- エンドポイントは `/rpc` に集約される
- 認証が必要な手続きは `protectedProcedure` を使用し、未認証時は `UNAUTHORIZED` エラーを返す
- バリデーションは Zod スキーマで行う
- エラーレスポンスは oRPC の標準エラー形式に従う

---

## 2. 認証 API（better-auth）

better-auth が `/api/auth/*` を自動的に処理する。直接 oRPC ルーターには含めない。

| エンドポイント | メソッド | 概要 |
|---------------|---------|------|
| `/api/auth/sign-up/email` | POST | アカウント登録 |
| `/api/auth/sign-in/email` | POST | ログイン |
| `/api/auth/sign-out` | POST | ログアウト |
| `/api/auth/get-session` | GET | 現在のセッション取得 |

---

## 3. oRPC ルーター一覧

### 3.1 システム

#### `healthCheck`

| 項目 | 内容 |
|------|------|
| 認証 | 不要 |
| 概要 | サーバー死活確認 |
| レスポンス | `"OK"` |

---

### 3.2 日記 (`diary.*`)

#### `diary.create`

| 項目 | 内容 |
|------|------|
| 認証 | 必要 |
| 概要 | 日記を新規作成する |

**入力スキーマ**

```ts
{
  date: string;           // ISO 8601 date (YYYY-MM-DD)
  title: string;          // max 100
  weather?: "sunny" | "cloudy" | "rainy" | "snowy" | "other";
  events?: string;
  mood?: "great" | "good" | "neutral" | "bad" | "terrible";
  goodThings?: string;
  reflections?: string;
  gratitude?: string;
  tomorrowGoals?: string;
  tomorrowJoys?: string;
  learnings?: string;
  habitChecks?: { label: string; checked: boolean }[];
  todayInOneWord?: string; // max 100
  freeText?: string;
  isPublic?: boolean;      // default: false
}
```

**レスポンス**

```ts
{
  id: string;
  createdAt: string;
}
```

---

#### `diary.update`

| 項目 | 内容 |
|------|------|
| 認証 | 必要（本人のみ） |
| 概要 | 既存の日記を更新する |

**入力スキーマ**

```ts
{
  id: string;
  // diary.create と同じ任意フィールド（Partial）
  date?: string;
  title?: string;
  weather?: ...;
  // ... （同上）
  isPublic?: boolean;
}
```

**レスポンス**

```ts
{ success: true }
```

**エラー**
- `NOT_FOUND` — 指定 ID が存在しない
- `FORBIDDEN` — 本人以外が操作しようとした

---

#### `diary.delete`

| 項目 | 内容 |
|------|------|
| 認証 | 必要（本人のみ） |
| 概要 | 日記を論理削除する |

**入力スキーマ**

```ts
{ id: string }
```

**レスポンス**

```ts
{ success: true }
```

**エラー**
- `NOT_FOUND`
- `FORBIDDEN`

---

#### `diary.getById`

| 項目 | 内容 |
|------|------|
| 認証 | 必要（非公開は本人のみ） |
| 概要 | 日記を 1 件取得する |

**入力スキーマ**

```ts
{ id: string }
```

**レスポンス** — `DiaryEntry`（下記「共通型」参照）

**エラー**
- `NOT_FOUND`
- `FORBIDDEN` — 非公開日記に他ユーザーがアクセスした場合

---

#### `diary.list`

| 項目 | 内容 |
|------|------|
| 認証 | 必要 |
| 概要 | 自分の日記一覧を取得する（ページネーション対応） |

**入力スキーマ**

```ts
{
  page?: number;    // default: 1
  limit?: number;   // default: 20, max: 100
  keyword?: string; // タイトルまたは自由記述欄のあいまい検索
}
```

**レスポンス**

```ts
{
  items: DiaryEntry[];
  total: number;
  page: number;
  limit: number;
}
```

---

#### `diary.listPublic`

| 項目 | 内容 |
|------|------|
| 認証 | 不要 |
| 概要 | 全ユーザーの公開日記一覧を取得する（ページネーション対応） |

**入力スキーマ**

```ts
{
  page?: number;  // default: 1
  limit?: number; // default: 20, max: 100
}
```

**レスポンス**

```ts
{
  items: PublicDiaryEntry[];
  total: number;
  page: number;
  limit: number;
}
```

---

### 3.3 メディアアップロード (`media.*`)

#### `media.getUploadUrl`

| 項目 | 内容 |
|------|------|
| 認証 | 必要 |
| 概要 | ファイルアップロード用の署名付き URL（またはアップロード先パス）を発行する |

**入力スキーマ**

```ts
{
  diaryId: string;
  type: "image" | "audio";
  filename: string;
  mimeType: string;
}
```

**レスポンス**

```ts
{
  uploadUrl: string; // PUT 先 URL
  mediaId: string;   // DB に登録された media レコード ID
}
```

**バリデーション**
- `image`: MIME タイプが `image/jpeg`, `image/png`, `image/webp` のみ許可
- `audio`: MIME タイプが `audio/mpeg`, `audio/wav`, `audio/mp4` のみ許可

---

#### `media.delete`

| 項目 | 内容 |
|------|------|
| 認証 | 必要（本人のみ） |
| 概要 | 指定のメディアを削除する |

**入力スキーマ**

```ts
{ mediaId: string }
```

**レスポンス**

```ts
{ success: true }
```

---

### 3.4 ユーザー設定 (`userSettings.*`)

#### `userSettings.get`

| 項目 | 内容 |
|------|------|
| 認証 | 必要 |
| 概要 | 自分の設定を取得する |

**レスポンス**

```ts
{
  visibleFields: {
    events: boolean;
    mood: boolean;
    goodThings: boolean;
    reflections: boolean;
    gratitude: boolean;
    tomorrowGoals: boolean;
    tomorrowJoys: boolean;
    learnings: boolean;
    habitChecks: boolean;
    todayInOneWord: boolean;
  };
  habitCheckItems: { id: string; label: string; order: number }[];
}
```

---

#### `userSettings.update`

| 項目 | 内容 |
|------|------|
| 認証 | 必要 |
| 概要 | 自分の設定を更新する |

**入力スキーマ** — `userSettings.get` レスポンスと同形（Partial）

**レスポンス**

```ts
{ success: true }
```

---

### 3.5 プロフィール (`profile.*`)

#### `profile.update`

| 項目 | 内容 |
|------|------|
| 認証 | 必要 |
| 概要 | 表示名・アイコン画像 URL を更新する |

**入力スキーマ**

```ts
{
  name?: string;
  image?: string; // URL
}
```

**レスポンス**

```ts
{ success: true }
```

---

## 4. 共通型定義

### `DiaryEntry`

```ts
type DiaryEntry = {
  id: string;
  userId: string;
  date: string;
  title: string;
  weather: string | null;
  events: string | null;
  mood: string | null;
  goodThings: string | null;
  reflections: string | null;
  gratitude: string | null;
  tomorrowGoals: string | null;
  tomorrowJoys: string | null;
  learnings: string | null;
  habitChecks: { label: string; checked: boolean }[] | null;
  todayInOneWord: string | null;
  freeText: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  media: MediaItem[];
};
```

### `PublicDiaryEntry`

`DiaryEntry` から機密フィールドを除いたもの。加えて作成者情報を付与。

```ts
type PublicDiaryEntry = Omit<DiaryEntry, "userId" | "deletedAt"> & {
  author: {
    name: string;
    image: string | null;
  };
};
```

### `MediaItem`

```ts
type MediaItem = {
  id: string;
  type: "image" | "audio";
  url: string;
  filename: string;
  order: number;
  createdAt: string;
};
```

---

## 5. エラーコード

| コード | HTTP 相当 | 説明 |
|--------|----------|------|
| `UNAUTHORIZED` | 401 | 未認証 |
| `FORBIDDEN` | 403 | アクセス権限なし |
| `NOT_FOUND` | 404 | リソースが存在しない |
| `BAD_REQUEST` | 400 | 入力値バリデーションエラー |
| `INTERNAL_SERVER_ERROR` | 500 | サーバー内部エラー |
