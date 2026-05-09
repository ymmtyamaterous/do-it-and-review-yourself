import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      redirect({ to: "/diary", throw: true });
    }
  },
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(true);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-16">
      {/* Brand mark */}
      <div className="mb-8 text-center">
        <p className="text-3xl font-bold tracking-tight text-foreground" style={{ fontFamily: "Manrope" }}>
          Diary
        </p>
        <p className="mt-1 text-sm text-muted-foreground" style={{ fontFamily: "Newsreader", fontStyle: "italic" }}>
          ~do it and review yourself~
        </p>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-sm ring-1 ring-black/5 dark:ring-white/8">
        {/* Tab switcher */}
        <div className="mb-7 flex rounded-xl bg-muted p-1">
          <button
            type="button"
            onClick={() => setShowSignIn(true)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              showSignIn
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "Manrope" }}
          >
            ログイン
          </button>
          <button
            type="button"
            onClick={() => setShowSignIn(false)}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
              !showSignIn
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "Manrope" }}
          >
            新規登録
          </button>
        </div>

        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}
      </div>
    </div>
  );
}
