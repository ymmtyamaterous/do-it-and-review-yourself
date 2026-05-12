import { authClient } from "@/lib/auth-client";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default function Header() {
  const { data: session } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        to="/public"
        className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        activeProps={{ className: "!text-foreground bg-accent" }}
        onClick={() => setMenuOpen(false)}
      >
        みんなの日記
      </Link>
      {session && (
        <Link
          to="/diary"
          className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          activeProps={{ className: "!text-foreground bg-accent" }}
          onClick={() => setMenuOpen(false)}
        >
          わたしの日記
        </Link>
      )}
    </>
  );

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

        {/* Nav (desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
          {/* Hamburger button (mobile only) */}
          <button
            type="button"
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? "メニューを閉じる" : "メニューを開く"}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border/60 bg-background px-6 py-3">
          <nav className="flex flex-col gap-1">
            {navLinks}
          </nav>
        </div>
      )}
    </header>
  );
}
