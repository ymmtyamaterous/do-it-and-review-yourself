# データベース設計書

## 1. 基本方針

- データベース: **SQLite**
- ORM: **Drizzle ORM**
- ID: `text` 型（`nanoid` / `cuid2` 等の短い UUID 文字列）
- 日時: `integer` 型（UNIX ミリ秒）で保存し、アプリ層で変換

---

## 2. テーブル一覧

| テーブル名 | 役割 | 備考 |
|-----------|------|------|
| `user` | ユーザー | better-auth が管理 |
| `session` | セッション | better-auth が管理 |
| `account` | OAuth / パスワード認証情報 | better-auth が管理 |
| `verification` | メール検証トークン | better-auth が管理 |
| `diary` | 日記本体 | 新規 |
| `diary_media` | 日記に添付された画像・音声 | 新規 |
| `user_settings` | ユーザーごとの設定 | 新規 |

---

## 3. テーブル定義

### 3.1 `user`（既存・better-auth）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | ユーザー ID |
| `name` | text | NOT NULL | 表示名 |
| `email` | text | NOT NULL, UNIQUE | メールアドレス |
| `emailVerified` | integer | NOT NULL | メール認証済みフラグ (0/1) |
| `image` | text | | アイコン画像 URL |
| `createdAt` | integer | NOT NULL | 作成日時（UNIX ms） |
| `updatedAt` | integer | NOT NULL | 更新日時（UNIX ms） |

---

### 3.2 `session`（既存・better-auth）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | セッション ID |
| `expiresAt` | integer | NOT NULL | 有効期限（UNIX ms） |
| `token` | text | NOT NULL, UNIQUE | セッショントークン |
| `createdAt` | integer | NOT NULL | 作成日時 |
| `updatedAt` | integer | NOT NULL | 更新日時 |
| `ipAddress` | text | | クライアント IP |
| `userAgent` | text | | ユーザーエージェント |
| `userId` | text | NOT NULL, FK→user.id | ユーザー ID |

---

### 3.3 `account`（既存・better-auth）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | アカウント ID |
| `accountId` | text | NOT NULL | プロバイダー側 ID |
| `providerId` | text | NOT NULL | プロバイダー名（例: `credential`） |
| `userId` | text | NOT NULL, FK→user.id | ユーザー ID |
| `accessToken` | text | | アクセストークン |
| `refreshToken` | text | | リフレッシュトークン |
| `idToken` | text | | ID トークン |
| `accessTokenExpiresAt` | integer | | アクセストークン有効期限 |
| `refreshTokenExpiresAt` | integer | | リフレッシュトークン有効期限 |
| `scope` | text | | スコープ |
| `password` | text | | ハッシュ化パスワード |
| `createdAt` | integer | NOT NULL | 作成日時 |
| `updatedAt` | integer | NOT NULL | 更新日時 |

---

### 3.4 `verification`（既存・better-auth）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | ID |
| `identifier` | text | NOT NULL | 検証対象識別子（メールアドレス等） |
| `value` | text | NOT NULL | 検証トークン |
| `expiresAt` | integer | NOT NULL | 有効期限 |
| `createdAt` | integer | | 作成日時 |
| `updatedAt` | integer | | 更新日時 |

---

### 3.5 `diary`（新規）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | 日記 ID |
| `userId` | text | NOT NULL, FK→user.id | 投稿者 ID |
| `date` | text | NOT NULL | 日記の日付（YYYY-MM-DD） |
| `title` | text | NOT NULL | タイトル（最大100文字） |
| `weather` | text | | 天気（`sunny`/`cloudy`/`rainy`/`snowy`/`other`） |
| `events` | text | | 出来事 |
| `mood` | text | | 感情（`great`/`good`/`neutral`/`bad`/`terrible`） |
| `goodThings` | text | | 良かったこと |
| `reflections` | text | | 反省点 |
| `gratitude` | text | | 感謝したこと |
| `tomorrowGoals` | text | | 明日の目標 |
| `tomorrowJoys` | text | | 明日の楽しみ |
| `learnings` | text | | 学んだこと・気づき |
| `habitChecks` | text | | 健康・習慣チェック（JSON 文字列） |
| `todayInOneWord` | text | | 今日を一言で（最大100文字） |
| `freeText` | text | | 自由記述欄 |
| `isPublic` | integer | NOT NULL, DEFAULT 0 | 公開フラグ（0: 非公開 / 1: 公開） |
| `createdAt` | integer | NOT NULL | 作成日時（UNIX ms） |
| `updatedAt` | integer | NOT NULL | 更新日時（UNIX ms） |
| `deletedAt` | integer | | 論理削除日時（NULL = 有効） |

**インデックス**

| インデックス名 | 対象カラム | 目的 |
|--------------|----------|------|
| `idx_diary_userId_date` | `userId`, `date DESC` | 自分の日記一覧の高速取得 |
| `idx_diary_isPublic_date` | `isPublic`, `date DESC` | 公開日記一覧の高速取得 |
| `idx_diary_deletedAt` | `deletedAt` | 論理削除フィルタリング |

**`habitChecks` カラムの JSON 構造**

```json
[
  { "label": "運動", "checked": true },
  { "label": "読書", "checked": false }
]
```

---

### 3.6 `diary_media`（新規）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | メディア ID |
| `diaryId` | text | NOT NULL, FK→diary.id | 紐付く日記 ID |
| `userId` | text | NOT NULL, FK→user.id | アップロードしたユーザー |
| `type` | text | NOT NULL | ファイル種別（`image` / `audio`） |
| `url` | text | NOT NULL | ファイルアクセス URL |
| `filename` | text | NOT NULL | 元ファイル名 |
| `mimeType` | text | NOT NULL | MIME タイプ |
| `sizeBytes` | integer | NOT NULL | ファイルサイズ（バイト） |
| `order` | integer | NOT NULL, DEFAULT 0 | 画像の表示順 |
| `createdAt` | integer | NOT NULL | 作成日時（UNIX ms） |

**制約**
- 1 件の日記に対し画像は最大 5 件、音声は最大 1 件（アプリ層で制御）

**インデックス**

| インデックス名 | 対象カラム | 目的 |
|--------------|----------|------|
| `idx_diary_media_diaryId` | `diaryId` | 日記に紐付くメディアの取得 |

---

### 3.7 `user_settings`（新規）

| カラム名 | 型 | 制約 | 説明 |
|---------|----|----|------|
| `id` | text | PK | 設定 ID |
| `userId` | text | NOT NULL, UNIQUE, FK→user.id | ユーザー ID（1ユーザー1行） |
| `visibleFields` | text | NOT NULL | 表示項目設定（JSON 文字列） |
| `habitCheckItems` | text | NOT NULL | 習慣チェック項目定義（JSON 文字列） |
| `createdAt` | integer | NOT NULL | 作成日時（UNIX ms） |
| `updatedAt` | integer | NOT NULL | 更新日時（UNIX ms） |

**`visibleFields` カラムの JSON 構造**（デフォルトはすべて `true`）

```json
{
  "events": true,
  "mood": true,
  "goodThings": true,
  "reflections": true,
  "gratitude": true,
  "tomorrowGoals": true,
  "tomorrowJoys": true,
  "learnings": true,
  "habitChecks": true,
  "todayInOneWord": true
}
```

**`habitCheckItems` カラムの JSON 構造**

```json
[
  { "id": "item_001", "label": "運動", "order": 0 },
  { "id": "item_002", "label": "読書", "order": 1 }
]
```

---

## 4. ER 図

```
user ─────────────────────────────────────────────────────────┐
  │ id                                                         │
  │                                                            │
  ├──< session (userId)                                        │
  ├──< account (userId)                                        │
  ├──< diary (userId) >──────────────────────────────────────┐│
  │     │ id                                                  ││
  │     └──< diary_media (diaryId, userId) ──────────────────┘│
  └──< user_settings (userId) ──────────────────────────────┘
```

---

## 5. マイグレーション方針

- `drizzle-kit generate` でマイグレーションファイルを自動生成する
- サーバー起動時に `drizzle-kit migrate`（または `db.migrate()`）を実行し、最新スキーマを自動適用する
- 開発時のシードデータ投入は `drizzle-kit` の seed 機能、または専用の seed スクリプトで行う
