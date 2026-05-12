import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Globe, Lock, Plus } from "lucide-react";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { orpc } from "@/utils/orpc";

type DiaryEntry = { id: string; date: string; title: string; isPublic: boolean };

function buildDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function DiaryCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [activeDate, setActiveDate] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<DiaryEntry[]>([]);

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth() + 1;

  const { data: monthEntries } = useQuery(
    orpc.diary.listByMonth.queryOptions({ input: { year, month } }),
  );

  const entryMap = new Map<string, DiaryEntry[]>();
  for (const entry of monthEntries ?? []) {
    const list = entryMap.get(entry.date) ?? [];
    list.push(entry);
    entryMap.set(entry.date, list);
  }

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveDate(new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1));
      setSelectedDate(null);
      setSelectedEntries([]);
    }
  };

  const handleClickDay = (date: Date) => {
    const key = buildDateKey(date);
    const entries = entryMap.get(key);
    if (!entries || entries.length === 0) {
      setSelectedDate(null);
      setSelectedEntries([]);
      navigate({ to: "/diary/new", search: { date: key } });
    } else if (entries.length === 1) {
      setSelectedDate(null);
      setSelectedEntries([]);
      navigate({ to: "/diary/$id", params: { id: entries[0].id } });
    } else {
      if (selectedDate === key) {
        setSelectedDate(null);
        setSelectedEntries([]);
      } else {
        setSelectedDate(key);
        setSelectedEntries(entries);
      }
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const key = buildDateKey(date);
    const entries = entryMap.get(key);
    if (entries && entries.length > 0) {
      return <span className="diary-dot" />;
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";
    const key = buildDateKey(date);
    const classes: string[] = [];
    if (entryMap.has(key)) classes.push("has-diary");
    if (selectedDate === key) classes.push("selected-diary-date");
    return classes.join(" ");
  };

  return (
    <div className="diary-calendar-wrapper">
      <Calendar
        locale="ja-JP"
        calendarType="gregory"
        onActiveStartDateChange={handleActiveStartDateChange}
        onClickDay={handleClickDay}
        tileContent={tileContent}
        tileClassName={tileClassName}
        maxDate={today}
      />
      {selectedDate && selectedEntries.length > 1 && (
        <div className="mt-4 rounded-2xl bg-card ring-1 ring-black/5 dark:ring-white/8 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              {selectedDate} の日記 ({selectedEntries.length}件)
            </p>
            <button
              type="button"
              onClick={() => { setSelectedDate(null); setSelectedEntries([]); }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              閉じる
            </button>
          </div>
          <ul className="divide-y divide-border">
            {selectedEntries.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => navigate({ to: "/diary/$id", params: { id: entry.id } })}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-foreground flex-1 truncate">
                    {entry.title}
                  </span>
                  {entry.isPublic ? (
                    <Globe className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              </li>
            ))}
          </ul>
          <div className="px-4 py-3 border-t border-border">
            <button
              type="button"
              onClick={() => {
                setSelectedDate(null);
                setSelectedEntries([]);
                navigate({ to: "/diary/new", search: { date: selectedDate } });
              }}
              className="flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              この日付で新しい日記を追加
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
