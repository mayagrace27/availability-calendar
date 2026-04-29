import { useEffect, useId, useRef, useState } from "react";
import styles from "./CheckInDatePicker.module.css";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Simulated “today” — calendar behaves as if this is the current date (April 8, 2026). */
export const REFERENCE_TODAY = new Date(2026, 3, 8);

/** Earliest month the picker can show (the month that contains `REFERENCE_TODAY`). */
const EARLIEST_VIEW_YEAR = REFERENCE_TODAY.getFullYear();
const EARLIEST_VIEW_MONTH = REFERENCE_TODAY.getMonth();

function isMonthBeforeEarliest(year: number, month: number): boolean {
  return year < EARLIEST_VIEW_YEAR || (year === EARLIEST_VIEW_YEAR && month < EARLIEST_VIEW_MONTH);
}

function clampViewMonth(year: number, month: number): [number, number] {
  if (isMonthBeforeEarliest(year, month)) {
    return [EARLIEST_VIEW_YEAR, EARLIEST_VIEW_MONTH];
  }
  return [year, month];
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** True for calendar months strictly after the month that contains `REFERENCE_TODAY` (e.g. May 2026+ when “today” is April 2026). */
function isStrictlyAfterReferenceMonth(year: number, month: number): boolean {
  return (
    year > EARLIEST_VIEW_YEAR ||
    (year === EARLIEST_VIEW_YEAR && month > EARLIEST_VIEW_MONTH)
  );
}

/**
 * Deterministic “inventory” (~10% of nights) for months strictly after April 2026.
 * Different salt per picker so check-in vs check-out strike unrelated days beyond the demos.
 */
function isSimulatedInventoryNightAfterApril(
  year: number,
  month: number,
  day: number,
  picker: "checkIn" | "checkOut",
): boolean {
  if (!isStrictlyAfterReferenceMonth(year, month)) return false;
  if (day === 1) return false;
  const salt = picker === "checkOut" ? 7919 : 0;
  let x = year * 372 + month * 31 + day + salt;
  x = Math.imul(x ^ (x >>> 16), 2246822519);
  x = Math.imul(x ^ (x >>> 13), 3266489917);
  return (x >>> 0) % 100 < 10;
}

/** Nights you cannot start a stay on (check-in calendar). Fixed Apr 23–24 + simulated later months. Apr 11 uses visual-only strike when not selected. */
function isInventoryBlockedCheckInNight(d: Date): boolean {
  const day = startOfDay(d);
  if (day < startOfDay(REFERENCE_TODAY)) return false;
  const y = day.getFullYear();
  const m = day.getMonth();
  const dom = day.getDate();
  if (y === 2026 && m === 3 && (dom === 23 || dom === 24)) return true;
  return isSimulatedInventoryNightAfterApril(y, m, dom, "checkIn");
}

/** Departures you cannot select (check-out calendar). Demo Apr 24–25 blocked for checkout here. */
function isInventoryBlockedCheckOutDay(d: Date): boolean {
  const day = startOfDay(d);
  if (day < startOfDay(REFERENCE_TODAY)) return false;
  const y = day.getFullYear();
  const m = day.getMonth();
  const dom = day.getDate();
  if (y === 2026 && m === 3 && (dom === 24 || dom === 25)) return true;
  return isSimulatedInventoryNightAfterApril(y, m, dom, "checkOut");
}

/** Future inventory for “can I check in on this night?” (shared by `isDateUnavailable`). */
function isFutureInventoryBlocked(d: Date): boolean {
  return isInventoryBlockedCheckInNight(d);
}

/** True when the date is in the past relative to the simulated “today” (not inventory-related). Figma `140:384` styling. */
export function isPastDate(d: Date): boolean {
  return startOfDay(d) < startOfDay(REFERENCE_TODAY);
}

/** Not bookable for check-in: past, or inventory-blocked check-in night. */
export function isDateUnavailable(d: Date): boolean {
  return isPastDate(d) || isFutureInventoryBlocked(d);
}

function nextCalendarDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
}

/**
 * Bookable check-in day whose following night is unavailable — guest can check out here,
 * but cannot start a stay into the blocked night (Figma “Check-out only”).
 */
export function isCheckoutOnlyBeforeBlocked(d: Date): boolean {
  if (isDateUnavailable(d)) return false;
  return isDateUnavailable(nextCalendarDay(d));
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function calendarDayDataKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function dateFromCalendarDayDataKey(s: string): Date {
  const [y, m, dom] = s.split("-").map(Number);
  return new Date(y, m, dom);
}

function isReferenceToday(d: Date): boolean {
  return sameDay(d, REFERENCE_TODAY);
}

/** Apr 11, 2026 (Sat) — sold-out look when not the chosen check-in. */
function isDemoApril11CheckInDay(d: Date): boolean {
  return d.getFullYear() === 2026 && d.getMonth() === 3 && d.getDate() === 11;
}

function buildGrid(viewYear: number, viewMonth: number): Date[] {
  const first = new Date(viewYear, viewMonth, 1);
  const pad = first.getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: Date[] = [];
  const prevMonthLast = new Date(viewYear, viewMonth, 0).getDate();
  for (let i = pad - 1; i >= 0; i--) {
    const dayNum = prevMonthLast - i;
    cells.push(new Date(viewYear, viewMonth - 1, dayNum));
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(viewYear, viewMonth, d));
  }
  let nextDay = 1;
  /* Figma: 5 rows only (35 cells), no 6th week row */
  while (cells.length < 35) {
    cells.push(new Date(viewYear, viewMonth + 1, nextDay));
    nextDay += 1;
  }
  return cells.slice(0, 35);
}

export function formatBookingDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

type Props = {
  selected: Date;
  onSelect: (d: Date) => void;
  onClose: () => void;
  /** `checkOut` shows “Check-out dates” and disables nights on or before `checkInDate`. */
  mode?: "checkIn" | "checkOut";
  /** Required when `mode` is `checkOut` — guest must depart after this night. */
  checkInDate?: Date;
  /** Shown in footer — Figma `47:875` / `47:883` */
  availabilityRooms?: number;
  availabilityAdults?: number;
  availabilityKids?: number;
};

/** Figma `167:3601` — "Availability based on 1 night: [#] Room, [#] Adults" */
function formatAvailabilityNote(rooms: number, adults: number, kids: number): string {
  const roomPart = `${rooms} Room${rooms === 1 ? "" : "s"}`;
  const adultPart = `${adults} Adult${adults === 1 ? "" : "s"}`;
  let s = `Availability based on 1 night: ${roomPart}, ${adultPart}`;
  if (kids > 0) {
    s += `, ${kids} Kid${kids === 1 ? "" : "s"}`;
  }
  return s;
}

/** Figma `14:6829` — 5×7 placeholder bars with Tailwind-style pulse */
const SKELETON_LOAD_MS = 1500;

function monthCacheKey(year: number, month: number): string {
  return `${year}-${month}`;
}

/** Shared across all picker instances — months already “loaded” in check-in skip skeleton in check-out. */
const loadedCalendarMonths = new Set<string>();

function SkeletonDateGrid() {
  return (
    <div className={styles.skeletonGrid} aria-hidden>
      {Array.from({ length: 5 }, (_, ri) => (
        <div key={ri} className={styles.skeletonDayRow}>
          {Array.from({ length: 7 }, (_, ci) => (
            <div key={ci} className={styles.skeletonDayCell}>
              <div className={`${styles.skeletonBar} ${styles.skeletonPulse}`} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/** Figma `140:809` (close) — exact filled path, inlined so it always renders */
function CloseIcon() {
  return (
    <svg
      className={styles.closeIcon}
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      aria-hidden
    >
      <path
        fill="#efa236"
        d="M4.26667 13.2L2.8 11.7333L6.53333 8L2.8 4.26667L4.26667 2.8L8 6.53333L11.7333 2.8L13.2 4.26667L9.46667 8L13.2 11.7333L11.7333 13.2L8 9.46667L4.26667 13.2Z"
      />
    </svg>
  );
}

/** Figma `120:4524` / `122:4853` — white chevrons on #212529 (iOS forward style via Material 24px paths) */
function ChevronLeft() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className={styles.navIcon} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z"
      />
    </svg>
  );
}

export function CheckInDatePicker({
  selected,
  onSelect,
  onClose,
  mode = "checkIn",
  checkInDate,
  availabilityRooms = 1,
  availabilityAdults = 2,
  availabilityKids = 0,
}: Props) {
  const checkInNightTipId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [viewYear, setViewYear] = useState(() =>
    clampViewMonth(selected.getFullYear(), selected.getMonth())[0],
  );
  const [viewMonth, setViewMonth] = useState(() =>
    clampViewMonth(selected.getFullYear(), selected.getMonth())[1],
  );
  const [calendarReady, setCalendarReady] = useState(() => {
    const [y, m] = clampViewMonth(selected.getFullYear(), selected.getMonth());
    return loadedCalendarMonths.has(monthCacheKey(y, m));
  });
  /** Hover overrides pale band; cleared on leave so idle state can use committed checkout. */
  const [checkoutHoverDate, setCheckoutHoverDate] = useState<Date | null>(null);
  /** Check-in: orange + white strike on hover for inventory / demo sold-out cells (parity with check-out picker). */
  const [checkInHoverDate, setCheckInHoverDate] = useState<Date | null>(null);

  const canGoPrev =
    viewYear > EARLIEST_VIEW_YEAR ||
    (viewYear === EARLIEST_VIEW_YEAR && viewMonth > EARLIEST_VIEW_MONTH);

  useEffect(() => {
    const [y, m] = clampViewMonth(selected.getFullYear(), selected.getMonth());
    setViewYear(y);
    setViewMonth(m);
  }, [selected]);

  /** In check-out mode, the check-in night is not a valid checkout but should read as a highlight, not “unavailable”. */
  function isCheckInNightInCheckoutPicker(d: Date): boolean {
    return mode === "checkOut" && Boolean(checkInDate && sameDay(d, checkInDate));
  }

  /** Live hover end, else confirmed checkout — keeps pale stay band when calendar reopens. */
  function effectiveCheckoutStayEnd(): Date | null {
    if (mode !== "checkOut" || !checkInDate) return null;
    if (checkoutHoverDate != null) {
      return checkoutHoverDate;
    }
    return startOfDay(selected) > startOfDay(checkInDate) ? selected : null;
  }

  /**
   * Orange “departure” ring: live hover, else committed checkout — so reopening shows the selected
   * check-out (e.g. Apr 25) with hover styling until the pointer moves over another date.
   */
  function effectiveCheckoutHoverCell(): Date | null {
    if (mode !== "checkOut") return null;
    if (checkoutHoverDate != null) return checkoutHoverDate;
    if (checkInDate && startOfDay(selected) > startOfDay(checkInDate)) {
      return selected;
    }
    return null;
  }

  /** Nights strictly between check-in night and stay end (hover preview or committed checkout). */
  function isInStaySpanPreviewBand(d: Date): boolean {
    const end = effectiveCheckoutStayEnd();
    if (mode !== "checkOut" || !checkInDate || !end) return false;
    const t0 = startOfDay(checkInDate).getTime();
    const te = startOfDay(end).getTime();
    const td = startOfDay(d).getTime();
    return te > t0 && td > t0 && td < te;
  }

  function handleCheckoutHover(d: Date) {
    if (mode !== "checkOut") return;
    setCheckoutHoverDate(new Date(d));
  }

  /** Grid-level so hover works on unavailable / `::after` and WebKit. See `data-calendar-day`. */
  function handleGridPointerOver(e: React.PointerEvent<HTMLDivElement>) {
    const raw = e.target;
    const el =
      raw instanceof Element ? raw : raw instanceof Text ? raw.parentElement : null;
    if (!el) return;
    const mark = el.closest("[data-calendar-day]");
    if (!mark) return;
    const key = mark.getAttribute("data-calendar-day");
    if (!key) return;
    const d = dateFromCalendarDayDataKey(key);
    if (mode === "checkOut") {
      handleCheckoutHover(d);
      return;
    }
    if (mode === "checkIn") {
      setCheckInHoverDate(new Date(d));
    }
  }

  /** Past or structurally invalid date (not inventory). Sold-out inventory days stay choosable — Figma `167:3146`. */
  function isInteractionBlockedInPicker(d: Date): boolean {
    if (isPastDate(d)) return true;
    if (mode === "checkOut" && checkInDate && startOfDay(d) <= startOfDay(checkInDate)) {
      return true;
    }
    return false;
  }

  /** Inventory sold-out strike styling (check-in nights / check-out days); selection still allowed. */
  function isInventoryUnavailableLook(d: Date): boolean {
    if (mode === "checkIn") {
      return isInventoryBlockedCheckInNight(d);
    }
    return isInventoryBlockedCheckOutDay(d);
  }

  useEffect(() => {
    const key = monthCacheKey(viewYear, viewMonth);
    if (loadedCalendarMonths.has(key)) {
      setCalendarReady(true);
      return;
    }

    setCalendarReady(false);
    const id = window.setTimeout(() => {
      loadedCalendarMonths.add(key);
      setCalendarReady(true);
    }, SKELETON_LOAD_MS);
    return () => window.clearTimeout(id);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    setCheckoutHoverDate(null);
    setCheckInHoverDate(null);
  }, [viewYear, viewMonth]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cells = buildGrid(viewYear, viewMonth);
  const rows: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }

  function prevMonth() {
    if (!canGoPrev) return;
    const d = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  function nextMonth() {
    const d = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  /** Figma `140:365` — same cell styles for padding days (e.g. next month) as in-month; no separate “adjacent” look. */
  function cellClass(date: Date): string {
    const interactionBlocked = isInteractionBlockedInPicker(date);
    const isSelected = sameDay(date, selected);

    /* Apr 11 selected: Figma `167:3146` orange+white strike */
    if (mode === "checkIn" && isDemoApril11CheckInDay(date) && isSelected) {
      return styles.cellUnavailableSoldAccent;
    }

    /* Check-in: hover on sold-out / inventory-unavailable — same accent as check-out picker (`167:3390`) */
    if (
      mode === "checkIn" &&
      !interactionBlocked &&
      checkInHoverDate != null &&
      sameDay(date, checkInHoverDate)
    ) {
      if (isInventoryUnavailableLook(date)) {
        return styles.cellUnavailableSoldAccent;
      }
      if (isDemoApril11CheckInDay(date)) {
        return styles.cellUnavailableSoldAccent;
      }
    }

    /* Apr 11 not selected: gray strike until hover (handled above) */
    if (mode === "checkIn" && isDemoApril11CheckInDay(date)) {
      return styles.cellUnavailable;
    }

    /* Check-out: orange departure ring — pointer hover overrides; idle uses committed checkout (stays on reopen). */
    if (mode === "checkOut" && !interactionBlocked) {
      const ringDate = effectiveCheckoutHoverCell();
      if (ringDate != null && sameDay(date, ringDate)) {
        return isInventoryUnavailableLook(date)
          ? styles.cellUnavailableSoldAccent
          : styles.cellSelected;
      }
    }

    if (isSelected && mode !== "checkOut") {
      return styles.cellSelected;
    }

    /* Check-out: check-in night (e.g. Apr 20) before “past” so a past check-in stays orange — Figma `140:441` / `140:485`. */
    if (isCheckInNightInCheckoutPicker(date) && !isSelected) {
      return styles.cellCheckInNight;
    }

    /* Check-out with check-in Apr 20: Apr 1–19 are muted like calendar-past, not sold-out strike — Figma `140:441`. */
    if (
      mode === "checkOut" &&
      checkInDate &&
      startOfDay(date) < startOfDay(checkInDate)
    ) {
      return styles.cellPast;
    }

    /* Calendar before “today” — Figma `140:384`. */
    if (isPastDate(date)) {
      return styles.cellPast;
    }

    if (isInventoryUnavailableLook(date)) {
      if (isInStaySpanPreviewBand(date)) {
        return styles.cellStayRangeUnavailable;
      }
      return styles.cellUnavailable;
    }

    if (isInStaySpanPreviewBand(date)) {
      return styles.cellStayRange;
    }

    if (mode === "checkOut" && isReferenceToday(date)) {
      return styles.cellToday;
    }

    return styles.cellAvailable;
  }

  const dialogLabel = mode === "checkOut" ? "Check-out dates" : "Check-in dates";
  const headerTitle = mode === "checkOut" ? "Check-out dates" : "Check-in dates";
  const loadedNodeId = mode === "checkOut" ? "22:1100" : "15:8333";

  return (
    <div
      ref={rootRef}
      className={styles.root}
      data-node-id={calendarReady ? loadedNodeId : "14:6829"}
      role="dialog"
      aria-label={dialogLabel}
      aria-busy={!calendarReady}
    >
      <div className={styles.headerTop}>
        <p className={styles.title}>{headerTitle}</p>
        <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close calendar">
          <CloseIcon />
        </button>
      </div>

      <div className={styles.monthNav}>
        {canGoPrev ? (
          <button
            type="button"
            className={styles.navBtn}
            onClick={prevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft />
          </button>
        ) : (
          <div className={styles.monthNavSpacer} aria-hidden />
        )}
        <p className={styles.monthLabel}>
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          className={styles.navBtn}
          onClick={nextMonth}
          aria-label="Next month"
        >
          <ChevronRight />
        </button>
      </div>

      <div className={styles.weekRow}>
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((w) => (
          <div key={w} className={styles.weekdayCell}>
            {w}
          </div>
        ))}
      </div>

      {calendarReady ? (
        <div
          className={styles.grid}
          onPointerOver={handleGridPointerOver}
          onMouseLeave={() => {
            if (mode === "checkOut") setCheckoutHoverDate(null);
            if (mode === "checkIn") setCheckInHoverDate(null);
          }}
          onPointerLeave={() => {
            if (mode === "checkOut") setCheckoutHoverDate(null);
            if (mode === "checkIn") setCheckInHoverDate(null);
          }}
        >
          {rows.map((row, ri) => (
            <div key={ri} className={styles.dayRow}>
              {row.map((date, ci) => {
                const dayKey = calendarDayDataKey(date);
                const interactionBlocked = isInteractionBlockedInPicker(date);
                const isSelected = sameDay(date, selected);
                const isCheckInNight = isCheckInNightInCheckoutPicker(date);
                const cls = cellClass(date);
                const label = date.getDate();
                const isRefToday = isReferenceToday(date);

                /* Past / structural invalid — not choosable; inventory sold-out still uses `<button>` below */
                if (interactionBlocked && !isCheckInNight) {
                  const isPast = isPastDate(date);
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      role="button"
                      tabIndex={-1}
                      className={`${styles.cell} ${cls}`}
                      data-calendar-day={dayKey}
                      aria-disabled="true"
                      aria-label={isPast ? `${label} — past date` : `${label} — unavailable`}
                      onClick={(e) => e.preventDefault()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") e.preventDefault();
                      }}
                    >
                      {label}
                    </div>
                  );
                }

                if (isCheckInNight && !isSelected) {
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={styles.checkInTooltipHost}
                      data-calendar-day={dayKey}
                    >
                      <div
                        role="button"
                        tabIndex={-1}
                        className={`${styles.cell} ${cls}`}
                        data-calendar-day={dayKey}
                        aria-disabled="true"
                        aria-label={`${label} — check-in`}
                        aria-describedby={checkInNightTipId}
                        onClick={(e) => e.preventDefault()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") e.preventDefault();
                        }}
                      >
                        {label}
                      </div>
                      <div
                        id={checkInNightTipId}
                        className={styles.checkInTooltip}
                        role="tooltip"
                        data-node-id="140:923"
                      >
                        <div className={styles.checkInTooltipBubble}>
                          <span className={styles.checkInTooltipText}>Check-In</span>
                        </div>
                        <div className={styles.checkInTooltipArrow} aria-hidden />
                      </div>
                    </div>
                  );
                }

                const ariaLabel =
                  `${label}${isRefToday ? ", today" : ""}${isSelected ? ", selected" : ""}`;

                return (
                  <button
                    key={`${ri}-${ci}`}
                    type="button"
                    className={`${styles.cell} ${cls}`}
                    data-calendar-day={dayKey}
                    onClick={() => {
                      if (isInteractionBlockedInPicker(date)) return;
                      onSelect(new Date(date));
                    }}
                    aria-label={ariaLabel}
                    aria-pressed={isSelected}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        <SkeletonDateGrid />
      )}

      <div className={styles.availabilityFooter} data-node-id="47:875">
        <div className={styles.availabilityFooterInner}>
          <p className={styles.availabilityNote} data-node-id="47:883">
            {formatAvailabilityNote(availabilityRooms, availabilityAdults, availabilityKids)}
          </p>
        </div>
      </div>
    </div>
  );
}
