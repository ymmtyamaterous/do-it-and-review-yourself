import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import { orpc } from "@/utils/orpc";

type DiaryEntry = { id: string; date: string };

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

  const year = activeDate.getFullYear();
  const month = activeDate.getMonth() + 1;

  const { data: monthEntries } = useQuery(
    orpc.diary.listByMonth.queryOptions({ input: { year, month } }),
  );

  const entryMap = new Map<string, DiaryEntry>();
  for (const entry of monthEntries ?? []) {
    entryMap.set(entry.date, entry);
  }

  const handleActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setActiveDate(new Date(activeStartDate.getFullYear(), activeStartDate.getMonth(), 1));
    }
  };

  const handleClickDay = (date: Date) => {
    const key = buildDateKey(date);
    const entry = entryMap.get(key);
    if (entry) {
      navigate({ to: "/diary/$id", params: { id: entry.id } });
    } else {
      navigate({ to: "/diary/new", search: { date: key } });
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;
    const key = buildDateKey(date);
    if (entryMap.has(key)) {
      return (
        <span className="diary-dot" />
      );
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";
    const key = buildDateKey(date);
    if (entryMap.has(key)) return "has-diary";
    return "";
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
    </div>
  );
}
