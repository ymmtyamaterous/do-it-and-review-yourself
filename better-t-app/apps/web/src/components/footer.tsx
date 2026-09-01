import { Link } from "@tanstack/react-router";

export default function Footer() {
  return (
    <footer className="border-border/60 border-t bg-background">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-6 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
        <p style={{ fontFamily: "Newsreader", fontStyle: "italic" }}>
          © {new Date().getFullYear()} Diary
        </p>
        <Link
          to="/privacy"
          className="w-fit rounded-md transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          activeProps={{ className: "text-foreground" }}
        >
          プライバシーポリシー
        </Link>
      </div>
    </footer>
  );
}