"use client";

import * as React from "react";
import { format, parse, isValid, addMonths, subMonths, setMonth, setYear } from "date-fns";
import { id, enUS } from "date-fns/locale";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { useLanguage } from "@/context/language-context";

interface DatePickerProps {
  value?: string; // format: "YYYY-MM-DD"
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder,
  disabled = false,
  className,
}: DatePickerProps) {
  const { t, language } = useLanguage();
  const activePlaceholder = placeholder || t("common.date_picker.placeholder");
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<"day" | "month" | "year">("day");

  const activeLocale = language === "id" ? id : enUS;

  // Parse string "YYYY-MM-DD" → Date object
  const selectedDate = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parse(value, "yyyy-MM-dd", new Date());
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const [currentMonth, setCurrentMonth] = React.useState<Date>(new Date());

  // Sync current month display when selected date changes or popover opens
  React.useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(selectedDate);
    }
  }, [selectedDate]);

  React.useEffect(() => {
    if (open) {
      setView("day");
      setCurrentMonth(selectedDate || new Date());
    }
  }, [open, selectedDate]);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
    } else {
      onChange?.("");
    }
    setOpen(false);
  };

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handlePrevYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 12));
  };

  const handleNextYear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 12));
  };

  const handlePrevDecade = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(subMonths(currentMonth, 120));
  };

  const handleNextDecade = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMonth(addMonths(currentMonth, 120));
  };

  const startYear = Math.floor(currentMonth.getFullYear() / 10) * 10;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            "border-input bg-transparent shadow-xs",
            "hover:bg-transparent hover:border-input",
            "dark:bg-input/30 dark:hover:bg-input/50 dark:active:bg-input/50",
            !selectedDate && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          {selectedDate ? (
            <span>{format(selectedDate, "dd MMMM yyyy", { locale: activeLocale })}</span>
          ) : (
            <span>{activePlaceholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-3 z-70 bg-popover text-popover-foreground shadow-md rounded-lg border border-neutral-200 dark:border-neutral-800" align="start">
        {view === "day" && (
          <div>
            {/* Custom Header for Day View */}
            <div className="flex items-center justify-between mb-2">
              <Button
                variant="outline"
                type="button"
                className="h-7 w-7 p-0 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100"
                onClick={handlePrevMonth}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                type="button"
                className="text-sm font-semibold px-2 py-1 rounded-md cursor-pointer"
                onClick={() => setView("month")}
              >
                {format(currentMonth, "MMMM yyyy", { locale: activeLocale })}
              </button>
              <Button
                variant="outline"
                type="button"
                className="h-7 w-7 p-0 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100"
                onClick={handleNextMonth}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* Calendar */}
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleSelect}
              month={currentMonth}
              onMonthChange={setCurrentMonth}
              locale={activeLocale}
              classNames={{
                caption: "hidden",
                nav: "hidden",
              }}
            />
          </div>
        )}

        {view === "month" && (
          <div>
            {/* Custom Header for Month View */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                type="button"
                className="h-7 w-7 p-0 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100"
                onClick={handlePrevYear}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <button
                type="button"
                className="text-sm font-semibold px-2 py-1 rounded-md cursor-pointer"
                onClick={() => setView("year")}
              >
                {currentMonth.getFullYear()}
              </button>
              <Button
                variant="outline"
                type="button"
                className="h-7 w-7 p-0 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100"
                onClick={handleNextYear}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* 3x4 Month Grid */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const monthDate = setMonth(currentMonth, i);
                const isSelected = selectedDate && selectedDate.getFullYear() === currentMonth.getFullYear() && selectedDate.getMonth() === i;
                const isActive = currentMonth.getMonth() === i;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(monthDate);
                      setView("day");
                    }}
                    className={cn(
                      "text-xs py-2 px-1 text-center rounded-md font-medium transition-all border border-transparent cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/95 active:bg-primary/95"
                        : isActive
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                        : "hover:bg-neutral-50 active:bg-neutral-50 dark:hover:bg-neutral-800/50 dark:active:bg-neutral-800/50 hover:border-neutral-200 active:border-neutral-200 dark:hover:border-neutral-700 dark:active:border-neutral-700 text-neutral-700 dark:text-neutral-300"
                    )}
                  >
                    {format(new Date(2020, i, 1), "MMMM", { locale: activeLocale }).substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {view === "year" && (
          <div>
            {/* Custom Header for Year View */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="outline"
                type="button"
                className="h-7 w-7 p-0 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100"
                onClick={handlePrevDecade}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold py-1">
                {startYear} - {startYear + 9}
              </span>
              <Button
                variant="outline"
                type="button"
                className="h-7 w-7 p-0 flex items-center justify-center opacity-70 hover:opacity-100 active:opacity-100"
                onClick={handleNextDecade}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* 3x4 Year Grid (renders 12 years: startYear - 1 to startYear + 10) */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const yearValue = startYear - 1 + i;
                const isSelected = selectedDate && selectedDate.getFullYear() === yearValue;
                const isActive = currentMonth.getFullYear() === yearValue;
                const isOutside = yearValue < startYear || yearValue > startYear + 9;

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCurrentMonth(setYear(currentMonth, yearValue));
                      setView("month");
                    }}
                    className={cn(
                      "text-xs py-2 px-1 text-center rounded-md font-medium transition-all border border-transparent cursor-pointer",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/95 active:bg-primary/95"
                        : isActive
                        ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white"
                        : "hover:bg-neutral-50 active:bg-neutral-50 dark:hover:bg-neutral-800/50 dark:active:bg-neutral-800/50 hover:border-neutral-200 active:border-neutral-200 dark:hover:border-neutral-700 dark:active:border-neutral-700 text-neutral-700 dark:text-neutral-300",
                      isOutside && "opacity-40"
                    )}
                  >
                    {yearValue}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
