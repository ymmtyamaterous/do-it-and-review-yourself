import { Link, createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "プライバシーポリシー | Diary" },
      {
        name: "description",
        content: "Diaryのプライバシーポリシーです。",
      },
    ],
  }),
});

const sections = [
  {
    title: "1. 取得する情報",
    content: (
      <>
        <p>本サービスでは、次の情報を取得します。</p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          <li>アカウント登録時に入力する名前、メールアドレスおよび認証情報</li>
          <li>日記の本文、天気・感情・習慣などの記録、公開設定</li>
          <li>日記に添付された画像・音声ファイルと、そのファイル名・形式・サイズ</li>
          <li>ログイン状態を維持し、不正利用を防ぐためのセッション情報、IPアドレスおよびブラウザ情報</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. 利用目的",
    content: (
      <ul className="list-disc space-y-1.5 pl-5">
        <li>本サービスの提供、本人確認、アカウントおよび日記データの管理</li>
        <li>公開を選択した日記を、他の利用者が閲覧できるようにするため</li>
        <li>不正利用の防止、障害対応およびサービスの安全性・品質の維持</li>
      </ul>
    ),
  },
  {
    title: "3. 公開情報の取扱い",
    content: (
      <p>
        日記は初期設定では非公開です。利用者が公開を選択した日記および公開対象として設定した項目は、本サービスを利用する他の方が閲覧できる場合があります。公開する内容には、個人を特定できる情報や第三者の個人情報を含めないようご注意ください。
      </p>
    ),
  },
  {
    title: "4. 第三者提供",
    content: (
      <p>
        法令に基づく場合、人の生命・身体・財産の保護のために必要な場合、または利用者の同意がある場合を除き、取得した個人情報を第三者へ提供しません。公開設定により閲覧可能となる情報は、この限りではありません。
      </p>
    ),
  },
  {
    title: "5. 安全管理",
    content: (
      <p>
        本サービスは、通信の保護、認証情報の適切な管理、アクセス制御その他の合理的な安全管理措置を講じ、個人情報への不正なアクセス、漏えい、改ざんまたは滅失の防止に努めます。
      </p>
    ),
  },
  {
    title: "6. Cookie等の利用",
    content: (
      <p>
        本サービスでは、ログイン状態の維持、セキュリティの確保および表示設定の保存のためにCookieまたはこれに類する技術を使用します。ブラウザの設定でCookieを無効にした場合、一部の機能を利用できないことがあります。
      </p>
    ),
  },
  {
    title: "7. 情報の確認・削除",
    content: (
      <p>
        利用者は、設定画面からプロフィールおよび日記の内容を確認・変更できます。個人情報の取扱いに関する確認、訂正または削除のご希望は、サービス管理者へお問い合わせください。
      </p>
    ),
  },
  {
    title: "8. ポリシーの変更",
    content: (
      <p>
        本サービスは、必要に応じて本ポリシーを変更することがあります。変更後のポリシーは、このページに掲載した時点から適用されます。
      </p>
    ),
  },
];

function PrivacyPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 md:py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-muted-foreground text-sm transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" />
        トップへ戻る
      </Link>

      <header className="mt-8 border-border border-b pb-8">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="font-bold text-3xl text-foreground tracking-tight md:text-4xl" style={{ fontFamily: "Manrope" }}>
          プライバシーポリシー
        </h1>
        <p className="mt-3 text-muted-foreground text-sm">最終更新日：2026年9月1日</p>
      </header>

      <div className="mt-8 rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/5 sm:p-8 dark:ring-white/8">
        <p className="text-muted-foreground leading-7">
          Diary（以下「本サービス」といいます。）は、利用者のプライバシーを尊重し、個人情報を適切に取り扱います。本ポリシーでは、本サービスにおける情報の取扱いについて説明します。
        </p>

        <div className="mt-9 space-y-8">
          {sections.map(({ title, content }) => (
            <section key={title}>
              <h2 className="font-semibold text-foreground text-lg" style={{ fontFamily: "Manrope" }}>
                {title}
              </h2>
              <div className="mt-3 text-muted-foreground text-sm leading-7">{content}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
