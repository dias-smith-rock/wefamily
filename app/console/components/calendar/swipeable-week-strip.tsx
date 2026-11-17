"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import type { CalendarEvent } from "../../calendar/types";
import {
  buildWeekStripDays,
  localeFirstWeekday,
  shiftDateByWeeks,
} from "../../calendar/week-calendar";
import { dateKey } from "../../calendar/month-utils";

const SWIPE_THRESHOLD_PX = 40;
const AXIS_LOCK_PX = 6;

type SwipeableWeekStripProps = {
  selectedDate: Date;
  events: CalendarEvent[];
  onSelectDay: (date: Date) => void;
  onShiftWeek: (weekDelta: number) => void;
};

export function SwipeableWeekStrip({
  selectedDate,
  events,
  onSelectDay,
  onShiftWeek,
}: SwipeableWeekStripProps) {
  const { t } = useDictionary();
  const rootRef = useRef<HTMLDivElement>(null);
  const onShiftWeekRef = useRef(onShiftWeek);
  const suppressClickRef = useRef(false);
  const gestureRef = useRef<{
    startX: number;
    startY: number;
    axis: "none" | "x" | "y";
    dragging: boolean;
  } | null>(null);
  const dragXRef = useRef(0);

  const [pageWidth, setPageWidth] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [transition, setTransition] = useState(false);

  onShiftWeekRef.current = onShiftWeek;
  dragXRef.current = dragX;

  const firstWeekday = useMemo(() => localeFirstWeekday(), []);
  const selectedKey = dateKey(selectedDate);

  const pages = useMemo(() => {
    return [-1, 0, 1].map((offset) => {
      const highlight = shiftDateByWeeks(selectedDate, offset);
      return buildWeekStripDays(highlight, events, firstWeekday).map((day) => ({
        ...day,
        isSelected: offset === 0 && day.isSelected,
      }));
    });
  }, [selectedDate, events, firstWeekday]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setPageWidth(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setTransition(false);
    setDragX(0);
  }, [selectedKey]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const commit = (dx: number) => {
      const w = el.clientWidth || 1;
      if (dx <= -SWIPE_THRESHOLD_PX) {
        setTransition(true);
        setDragX(-w);
        window.setTimeout(() => {
          onShiftWeekRef.current(1);
          setTransition(false);
          setDragX(0);
        }, 180);
        return;
      }
      if (dx >= SWIPE_THRESHOLD_PX) {
        setTransition(true);
        setDragX(w);
        window.setTimeout(() => {
          onShiftWeekRef.current(-1);
          setTransition(false);
          setDragX(0);
        }, 180);
        return;
      }
      setTransition(true);
      setDragX(0);
      window.setTimeout(() => setTransition(false), 180);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      gestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        axis: "none",
        dragging: false,
      };
      setTransition(false);
    };

    const onTouchMove = (e: TouchEvent) => {
      const g = gestureRef.current;
      if (!g || e.touches.length !== 1) return;
      const touch = e.touches[0]!;
      const dx = touch.clientX - g.startX;
      const dy = touch.clientY - g.startY;

      if (g.axis === "none") {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        g.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      }
      if (g.axis !== "x") return;

      g.dragging = true;
      suppressClickRef.current = true;
      e.preventDefault();
      const w = el.clientWidth || 1;
      setDragX(Math.max(-w, Math.min(w, dx)));
    };

    const onTouchEnd = (e: TouchEvent) => {
      const g = gestureRef.current;
      gestureRef.current = null;
      if (!g || !g.dragging || g.axis !== "x") {
        suppressClickRef.current = false;
        return;
      }
      const touch = e.changedTouches[0];
      const dx = touch ? touch.clientX - g.startX : dragXRef.current;
      commit(dx);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 50);
    };

    let mouseDown = false;
    const onMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      mouseDown = true;
      gestureRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        axis: "none",
        dragging: false,
      };
      setTransition(false);
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!mouseDown || !gestureRef.current) return;
      const g = gestureRef.current;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      if (g.axis === "none") {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        g.axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      }
      if (g.axis !== "x") return;
      g.dragging = true;
      suppressClickRef.current = true;
      const w = el.clientWidth || 1;
      setDragX(Math.max(-w, Math.min(w, dx)));
    };
    const onMouseUp = (e: MouseEvent) => {
      if (!mouseDown) return;
      mouseDown = false;
      const g = gestureRef.current;
      gestureRef.current = null;
      if (!g || !g.dragging || g.axis !== "x") {
        suppressClickRef.current = false;
        return;
      }
      commit(e.clientX - g.startX);
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 50);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const translateX = pageWidth > 0 ? -pageWidth + dragX : dragX;

  return (
    <div className="flex w-full min-w-0 items-center gap-0.5 px-1">
      <button
        type="button"
        className="flex h-10 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition active:bg-white/10"
        aria-label="Previous week"
        onClick={() => onShiftWeek(-1)}
      >
        <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
      </button>

      <div
        ref={rootRef}
        className="relative min-h-[64px] min-w-0 flex-1 overflow-hidden"
        aria-label={t("console.calendar.timeline")}
        style={{ touchAction: "pan-y" }}
      >
        <div
          className="flex will-change-transform"
          style={{
            width: pageWidth > 0 ? pageWidth * 3 : "300%",
            transform: `translate3d(${translateX}px, 0, 0)`,
            transition: transition
              ? "transform 180ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
          }}
        >
          {pages.map((days, pageIndex) => (
            <div
              key={pageIndex}
              className="grid shrink-0 grid-cols-7 py-1"
              style={{
                width: pageWidth > 0 ? pageWidth : "33.333%",
              }}
            >
              {days.map((day) => {
                const selected = day.isSelected;
                return (
                  <button
                    key={`${pageIndex}-${dateKey(day.date)}`}
                    type="button"
                    onClick={() => {
                      if (suppressClickRef.current) return;
                      onSelectDay(day.date);
                    }}
                    aria-pressed={selected}
                    className="flex w-full flex-col items-center gap-1 py-1"
                  >
                    <span
                      className={`text-[11px] font-medium ${
                        selected || day.isToday
                          ? "text-[#7CC4FF]"
                          : "text-white/45"
                      }`}
                    >
                      {day.weekdayShort}
                    </span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold tabular-nums transition ${
                        selected
                          ? "bg-[#0A84FF] text-white shadow-[0_0_0_4px_rgba(10,132,255,0.22)]"
                          : day.isToday
                            ? "text-[#3B9EFF]"
                            : "text-white"
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        day.hasEvents
                          ? selected
                            ? "bg-[#0A84FF]"
                            : "bg-[#FF9F0A]"
                          : "bg-transparent"
                      }`}
                      aria-hidden
                    />
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="flex h-10 w-8 shrink-0 items-center justify-center rounded-full text-white/70 transition active:bg-white/10"
        aria-label="Next week"
        onClick={() => onShiftWeek(1)}
      >
        <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
      </button>
    </div>
  );
}
