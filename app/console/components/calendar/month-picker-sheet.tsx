"use client";

import type { CalendarEvent } from "../../calendar/types";
import {
  addMonths,
  buildMonthGrid,
  formatMonthYearTitle,
  MONTH_PICKER_WEEKDAYS,
  startOfDay,
  startOfMonth,
  taskDotsForDate,
  type MonthGridCell,
  type TaskDotTone,
} from "../../calendar/month-utils";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type MonthPickerSheetProps = {
  open: boolean;
  onClose: () => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  events: CalendarEvent[];
  viewingMonth: Date;
  onViewingMonthChange: (month: Date) => void;
};

function TaskDotRow({ tones }: { tones: TaskDotTone[] }) {
  if (tones.length === 0) {
    return <div className="mt-1 h-1" aria-hidden />;
  }

  return (
    <div className="mt-1 flex flex-row justify-center gap-0.5" aria-hidden>
      {tones.map((tone, index) => (
        <span
          key={index}
          className={`h-1 w-1 rounded-full ${
            tone === "orange" ? "bg-orange-500" : "bg-blue-500"
          }`}
        />
      ))}
    </div>
  );
}

function MonthGridPanel({
  monthAnchor,
  selectedDate,
  events,
  onSelectDay,
}: {
  monthAnchor: Date;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDay: (date: Date) => void;
}) {
  const cells = buildMonthGrid(monthAnchor, selectedDate);

  return (
    <div className="grid grid-cols-7 gap-y-4 px-1">
      {cells.map((cell) => (
        <MonthDayCell
          key={dateCellKey(cell)}
          cell={cell}
          dots={taskDotsForDate(events, cell.date)}
          onSelect={() => onSelectDay(cell.date)}
        />
      ))}
    </div>
  );
}

function dateCellKey(cell: MonthGridCell): string {
  return cell.date.toISOString();
}

function MonthDayCell({
  cell,
  dots,
  onSelect,
}: {
  cell: MonthGridCell;
  dots: TaskDotTone[];
  onSelect: () => void;
}) {
  const { t } = useDictionary();
  const { inCurrentMonth, isSelected, isToday, dayNumber } = cell;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isSelected}
      aria-label={t("console.calendar.dayAria", { day: dayNumber })}
      className="flex flex-col items-center justify-start"
    >
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] tabular-nums transition-colors ${
          isSelected
            ? "bg-black font-semibold text-white"
            : isToday
              ? "font-bold text-gray-900"
              : inCurrentMonth
                ? "text-gray-900"
                : "text-gray-300"
        }`}
      >
        {dayNumber}
      </span>
      <TaskDotRow tones={dots} />
    </button>
  );
}

function MonthSwipeCarousel({
  viewingMonth,
  onViewingMonthChange,
  selectedDate,
  events,
  onSelectDay,
}: {
  viewingMonth: Date;
  onViewingMonthChange: (month: Date) => void;
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDay: (date: Date) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isResettingRef = useRef(false);

  const monthOffsets = [-1, 0, 1] as const;
  const months = monthOffsets.map((offset) => addMonths(viewingMonth, offset));

  const scrollToCenter = useCallback((behavior: ScrollBehavior = "auto") => {
    const el = scrollRef.current;
    if (!el) return;
    isResettingRef.current = true;
    const page = el.clientWidth;
    el.scrollTo({ left: page, behavior });
    requestAnimationFrame(() => {
      isResettingRef.current = false;
    });
  }, []);

  useEffect(() => {
    scrollToCenter("auto");
  }, [viewingMonth, scrollToCenter]);

  const handleScroll = () => {
    if (isResettingRef.current) return;
    if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    scrollEndTimerRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el || isResettingRef.current) return;
      const page = el.clientWidth;
      if (page <= 0) return;
      const index = Math.round(el.scrollLeft / page);
      if (index === 0) {
        onViewingMonthChange(addMonths(viewingMonth, -1));
      } else if (index === 2) {
        onViewingMonthChange(addMonths(viewingMonth, 1));
      }
    }, 80);
  };

  useEffect(
    () => () => {
      if (scrollEndTimerRef.current) clearTimeout(scrollEndTimerRef.current);
    },
    [],
  );

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="flex overflow-x-auto snap-x snap-mandatory overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ msOverflowStyle: "none", scrollbarWidth: "none" }}
    >
      {months.map((month) => (
        <div
          key={`${month.getFullYear()}-${month.getMonth()}`}
          className="w-full shrink-0 snap-center"
        >
          <MonthGridPanel
            monthAnchor={month}
            selectedDate={selectedDate}
            events={events}
            onSelectDay={onSelectDay}
          />
        </div>
      ))}
    </div>
  );
}

export function MonthPickerSheet({
  open,
  onClose,
  selectedDate,
  onSelectDate,
  events,
  viewingMonth,
  onViewingMonthChange,
}: MonthPickerSheetProps) {
  const { t } = useDictionary();
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    if (!open) {
      setEntered(false);
      return;
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => setEntered(true));
    return () => {
      cancelAnimationFrame(frame);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleSelectDay = (date: Date) => {
    onSelectDate(startOfDay(date));
    window.setTimeout(() => onClose(), 100);
  };

  const handleToday = () => {
    const today = startOfDay(new Date());
    onSelectDate(today);
    onViewingMonthChange(startOfMonth(today));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          entered ? "opacity-100" : "opacity-0"
        }`}
        aria-label={t("console.calendar.closeMonthPicker")}
        onClick={onClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 mx-auto w-full max-w-lg rounded-t-3xl bg-white pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-8px_40px_rgba(0,0,0,0.12)] transition-transform duration-300 ease-out ${
          entered ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={t("console.calendar.selectDate")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center">
          <div
            className="mb-2 mt-3 h-1.5 w-10 rounded-full bg-gray-300"
            aria-hidden
          />
        </div>

        <div className="flex items-center justify-between gap-3 px-5 pb-4">
          <h2 className="text-[20px] font-bold uppercase tracking-wide text-gray-900">
            {formatMonthYearTitle(viewingMonth)}
          </h2>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={handleToday}
              className="rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-semibold text-blue-600 transition active:opacity-80"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition active:bg-gray-200"
              aria-label={t("common.close")}
            >
              <X className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-y-2 px-5 pb-2">
          {MONTH_PICKER_WEEKDAYS.map((label) => (
            <span
              key={label}
              className="text-center text-[11px] font-medium text-gray-400"
            >
              {label}
            </span>
          ))}
        </div>

        <div className="px-4 pb-4">
          <MonthSwipeCarousel
            viewingMonth={viewingMonth}
            onViewingMonthChange={onViewingMonthChange}
            selectedDate={selectedDate}
            events={events}
            onSelectDay={handleSelectDay}
          />
        </div>
      </div>
    </div>
  );
}
