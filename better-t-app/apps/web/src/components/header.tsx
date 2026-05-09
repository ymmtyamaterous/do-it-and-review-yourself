import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline text-foreground">
          <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "Manrope" }}>
            Diary
          </span>
          <span
            className="hidden text-xs text-muted-foreground sm:inline"
            style={{ fontFamily: "Newsreader", fontStyle: "italic" }}
          >
            ~do it and review yourself~
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            to="/public"
            className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeProps={{ className: "!text-foreground bg-accent" }}
          >
            みんなの日記
          </Link>
          {session && (
            <Link
              to="/diary"
              className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "!text-foreground bg-accent" }}
            >
              わたしの日記
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
