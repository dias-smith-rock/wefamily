"use client";

import { Check } from "lucide-react";
import { useMemo } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { CalendarEvent } from "../../calendar/types";
import {
  MONTH_PICKER_WEEKDAYS,
  buildMonthGrid,
  dateKey,
  eventsOnDate,
  formatMonthYearTitle,
  startOfMonth,
} from "../../calendar/month-utils";

export function MonthGridView({
  viewingMonth,
  selectedDate,
  events,
  onSelectDate,
  onEventPress,
}: {
  viewingMonth: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDate: (date: Date) => void;
  onEventPress: (event: CalendarEvent) => void;
}) {
  const { t } = useDictionary();
  const monthAnchor = startOfMonth(viewingMonth);
  const cells = useMemo(
    () => buildMonthGrid(monthAnchor, selectedDate),
    [monthAnchor, selectedDate],
  );

  return (
    <div className="px-3 pb-28 pt-1">
      <h2 className="px-1 pb-3 text-[28px] font-bold tracking-tight text-white">
        {formatMonthYearTitle(monthAnchor)}
      </h2>

      <div className="mb-1 grid grid-cols-7 gap-1 px-0.5">
        {MONTH_PICKER_WEEKDAYS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-[11px] font-semibold text-[#7CC4FF]/90"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 items-stretch gap-1">
        {cells.map((cell) => {
          const dayEvents = eventsOnDate(events, cell.date).slice(0, 3);
          return (
            <button
              key={dateKey(cell.date)}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`flex min-h-[74px] flex-col items-stretch justify-start rounded-xl px-1 pb-1 pt-1 text-left transition ${
                cell.inCurrentMonth ? "bg-white/[0.04]" : "bg-transparent opacity-40"
              } ${cell.isSelected ? "ring-1 ring-[#0A84FF]/70" : ""}`}
            >
              <span className="flex h-6 w-full shrink-0 items-start justify-start">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-bold tabular-nums leading-none ${
                    cell.isToday
                      ? "bg-[#0A84FF] text-white"
                      : "text-white/90"
                  }`}
                >
                  {cell.dayNumber}
                </span>
              </span>
              <div className="mt-1 flex min-h-0 flex-1 flex-col justify-start gap-0.5 overflow-hidden">
                {dayEvents.map((event) => (
                  <span
                    key={event.id}
                    role="presentation"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventPress(event);
                    }}
                    className="glass-card flex h-[14px] shrink-0 items-center gap-0.5 truncate rounded-md px-1 text-[9px] font-semibold leading-none text-white/95"
                  >
                    {event.isFlexibleTodo ? (
                      <Check className="h-2.5 w-2.5 shrink-0" strokeWidth={3} />
                    ) : null}
                    <span className="truncate">{event.title}</span>
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      {events.length === 0 ? (
        <p className="mt-10 text-center text-[14px] text-white/45">
          {t("console.calendar.noEvents")}
        </p>
      ) : null}
    </div>
  );
}
