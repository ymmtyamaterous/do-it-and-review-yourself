import { Button } from "@better-t-app/ui/components/button";
import { Link, createFileRoute } from "@tanstack/react-router";
import { BookOpen, Globe, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center md:py-36">
        {/* 背景装飾 */}
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          aria-hidden
        >
          <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-primary/6 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-secondary/6 blur-3xl" />
        </div>

        <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/8 px-4 py-1.5 text-xs font-medium text-primary">
          自己成長のための日記
        </span>

        <h1
          className="text-5xl font-bold tracking-tight text-foreground md:text-7xl"
          style={{ fontFamily: "Manrope", letterSpacing: "-0.02em" }}
        >
          Diary
        </h1>
        <p
          className="mt-2 text-lg font-semibold text-primary md:text-xl"
          style={{ fontFamily: "Newsreader", fontStyle: "italic" }}
        >
          ~do it and review yourself~
        </p>
        <p
          className="mt-6 max-w-lg text-muted-foreground"
          style={{ fontFamily: "Newsreader", fontSize: "18px", lineHeight: "30px" }}
        >
          天気・感情・出来事・振り返り。<br />
          一日を丁寧に記録して、自分自身と向き合う時間を作りましょう。
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button render={<Link to="/login" />} size="lg">
            はじめる — 無料
          </Button>
          <Button render={<Link to="/public" />} variant="outline" size="lg">
            みんなの日記を見る
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-4xl px-6 pb-24">
        <p
          className="mb-10 text-center text-sm font-medium uppercase tracking-widest text-muted-foreground"
          style={{ fontFamily: "Manrope" }}
        >
          できること
        </p>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: <BookOpen className="h-6 w-6 text-primary" />,
              title: "記録する",
              desc: "天気・感情・出来事など複数の項目で、今日の一日を丁寧に記録できます。",
            },
            {
              icon: <Sparkles className="h-6 w-6 text-primary" />,
              title: "振り返る",
              desc: "良かったこと・反省点・学びを書き出すことで、着実な自己成長につなげます。",
            },
            {
              icon: <Globe className="h-6 w-6 text-primary" />,
              title: "シェアする",
              desc: "公開設定で日記をシェア。他の人の視点から新しい気づきを得られます。",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex flex-col items-center rounded-2xl bg-card p-8 text-center shadow-sm ring-1 ring-black/5 dark:ring-white/8"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                {icon}
              </div>
              <h3
                className="mb-2 text-base font-semibold"
                style={{ fontFamily: "Manrope" }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-relaxed text-muted-foreground"
                style={{ fontFamily: "Newsreader", fontSize: "15px", lineHeight: "24px" }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA bottom */}
      <section className="mx-auto w-full max-w-3xl px-6 pb-24">
        <div className="flex flex-col items-center rounded-2xl bg-primary/6 px-8 py-12 text-center ring-1 ring-primary/20">
          <h2
            className="text-2xl font-bold text-foreground"
            style={{ fontFamily: "Manrope" }}
          >
            今日から始めましょう
          </h2>
          <p
            className="mt-3 text-muted-foreground"
            style={{ fontFamily: "Newsreader", fontSize: "16px", lineHeight: "26px" }}
          >
            アカウント登録は無料です。毎日の記録が、未来の自分への贈り物になります。
          </p>
          <Button render={<Link to="/login" />} size="lg" className="mt-6">
            無料で始める
          </Button>
        </div>
      </section>
    </div>
  );
}
