import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  CheckCircle2,
  Lock,
  Unlock,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Calendar,
  Moon,
  Sun,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';

/**
 * Helper to expand commitments onto the target date
 */
export const expandCommitmentsForDate = (commitments = [], targetDate = new Date()) => {
  const d = new Date(targetDate);
  const dayOfWeek = d.getDay();
  const expanded = [];

  for (const item of commitments) {
    if (!item.isRecurring) {
      const itemStart = new Date(item.startTime);
      if (
        itemStart.getFullYear() === d.getFullYear() &&
        itemStart.getMonth() === d.getMonth() &&
        itemStart.getDate() === d.getDate()
      ) {
        expanded.push({
          _id: item._id?.toString() || item.id,
          title: item.title,
          startTime: new Date(item.startTime),
          endTime: new Date(item.endTime),
          eventType: 'fixed_commitment',
          isFixedCommitment: true,
          category: item.category,
        });
      }
    } else {
      let applies = false;
      if (item.recurrencePattern === 'daily') {
        applies = true;
      } else if (item.recurrencePattern === 'weekdays' && dayOfWeek >= 1 && dayOfWeek <= 5) {
        applies = true;
      } else if (item.recurrencePattern === 'weekly' && item.daysOfWeek?.includes(dayOfWeek)) {
        applies = true;
      }

      if (applies) {
        const itemStart = new Date(item.startTime);
        const itemEnd = new Date(item.endTime);
        const startHours = itemStart.getHours();
        const startMins = itemStart.getMinutes();
        const endHours = itemEnd.getHours();
        const endMins = itemEnd.getMinutes();

        const mappedStart = new Date(d);
        mappedStart.setHours(startHours, startMins, 0, 0);

        const mappedEnd = new Date(d);
        mappedEnd.setHours(endHours, endMins, 0, 0);

        expanded.push({
          _id: item._id?.toString() || item.id,
          title: item.title,
          startTime: mappedStart,
          endTime: mappedEnd,
          eventType: 'fixed_commitment',
          isFixedCommitment: true,
          category: item.category,
          recurrencePattern: item.recurrencePattern,
        });
      }
    }
  }

  return expanded;
};

/**
 * 24-Hour Visual Daily Timeline Grid (00:00 - 24:00)
 */
export const TimelineGrid24Hour = ({
  date = new Date(),
  events = [],
  commitments = [],
  preferences = {},
  activeSession = null,
  onFocusTask = () => {},
  onCompleteEvent = () => {},
  onToggleLock = () => {},
  onDeleteEvent = null,
  onSlotClick = null,
  onAutoSchedule = null,
  containerHeight = '520px',
  hourHeight = 64, // px height per hour
  showStatsHeader = true,
  interactiveSlots = true,
}) => {
  const containerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const targetDate = new Date(date);
  const isToday = targetDate.toDateString() === new Date().toDateString();

  // Working & Sleep hours from preferences
  const workStartStr = preferences.workingHoursStart || '09:00';
  const workEndStr = preferences.workingHoursEnd || '18:00';
  const sleepStartStr = preferences.sleepStart || '23:00';
  const sleepEndStr = preferences.sleepEnd || '07:00';

  const parseTimeToMinutes = (str) => {
    const [h, m] = str.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const workStartMin = parseTimeToMinutes(workStartStr);
  const workEndMin = parseTimeToMinutes(workEndStr);
  const sleepStartMin = parseTimeToMinutes(sleepStartStr);
  const sleepEndMin = parseTimeToMinutes(sleepEndStr);

  // Filter events belonging to target date
  const dayEvents = events.filter((ev) => {
    const s = new Date(ev.startTime);
    return (
      s.getFullYear() === targetDate.getFullYear() &&
      s.getMonth() === targetDate.getMonth() &&
      s.getDate() === targetDate.getDate()
    );
  });

  // Expand commitments for target date
  const dayCommitments = expandCommitmentsForDate(commitments, targetDate);

  // Combine and sort all items
  const allDayBlocks = [...dayEvents, ...dayCommitments].sort(
    (a, b) => new Date(a.startTime) - new Date(b.startTime)
  );

  // Auto-scroll to current time on mount if today
  useEffect(() => {
    if (containerRef.current) {
      if (isToday) {
        const now = new Date();
        const currentMins = now.getHours() * 60 + now.getMinutes();
        const scrollTarget = Math.max(0, (currentMins / 60) * hourHeight - 120);
        containerRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      } else {
        // Scroll to workStart
        const scrollTarget = Math.max(0, (workStartMin / 60) * hourHeight - 40);
        containerRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
      }
    }
  }, [date, isToday, hourHeight, workStartMin]);

  const scrollToNow = () => {
    if (containerRef.current) {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      const scrollTarget = Math.max(0, (currentMins / 60) * hourHeight - 120);
      containerRef.current.scrollTo({ top: scrollTarget, behavior: 'smooth' });
    }
  };

  // Calculate stats for target date
  const totalAllocatedMins = dayEvents.reduce((acc, ev) => acc + (ev.allocatedMinutes || 0), 0);
  const completedMins = dayEvents
    .filter((ev) => ev.status === 'completed')
    .reduce((acc, ev) => acc + (ev.allocatedMinutes || 0), 0);
  const totalWorkingMins = Math.max(0, workEndMin - workStartMin);
  const freeWorkingMins = Math.max(0, totalWorkingMins - totalAllocatedMins);

  // Current time position in px
  const currentMinutesOfDay = currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentTimeTopPx = (currentMinutesOfDay / 60) * hourHeight;

  // Working window style
  const workTopPx = (workStartMin / 60) * hourHeight;
  const workHeightPx = Math.max(0, ((workEndMin - workStartMin) / 60) * hourHeight);

  // Format hour label
  const formatHourLabel = (hour) => {
    const h = hour % 24;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return {
      time24: `${String(h).padStart(2, '0')}:00`,
      display: `${displayHour} ${period}`,
      hour: h,
    };
  };

  return (
    <div className="flex flex-col bg-[#FFFFFF] rounded-2xl border border-[#EAE7F5] overflow-hidden shadow-card">
      {/* 24h Timeline Header & Summary Stats */}
      {showStatsHeader && (
        <div className="p-4 bg-gradient-to-r from-[#FAF9FD] via-[#FFFFFF] to-[#F7F5FD] border-b border-[#EAE7F5] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#ECE9FB] text-[#7A68DE] shadow-xs">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-[#26324A]">
                  24-Hour Timeline Grid
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#ECE9FB] text-[#6450C7] font-bold">
                  00:00 – 24:00
                </span>
                {isToday && (
                  <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#E4F7F0] text-[#1E7B58] font-bold border border-[#BCECD9]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3FB98B] animate-pulse" />
                    Live Today
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#718096] mt-0.5">
                {targetDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Metrics */}
            <div className="hidden sm:flex items-center gap-3 pr-2 text-xs font-semibold text-[#718096]">
              <div className="text-right">
                <div className="text-[10px] text-[#9AA5B8] uppercase">Allocated</div>
                <div className="font-mono text-[#26324A] font-bold">{Math.round(totalAllocatedMins / 60 * 10) / 10}h</div>
              </div>
              <div className="h-6 w-px bg-[#EAE7F5]" />
              <div className="text-right">
                <div className="text-[10px] text-[#9AA5B8] uppercase">Focus Blocks</div>
                <div className="font-mono text-[#8B7BE8] font-bold">{dayEvents.length}</div>
              </div>
            </div>

            {isToday && (
              <button
                onClick={scrollToNow}
                className="btn-secondary-pastel px-3 py-1.5 text-xs font-bold flex items-center gap-1.5"
                title="Scroll to current time"
              >
                <div className="w-2 h-2 rounded-full bg-[#8B7BE8]" />
                <span>Jump to Now</span>
              </button>
            )}

            {onAutoSchedule && dayEvents.length === 0 && (
              <button
                onClick={onAutoSchedule}
                className="btn-primary-pastel px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-button"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Schedule Day</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 24-Hour Scrollable Canvas */}
      <div
        ref={containerRef}
        style={{ height: containerHeight }}
        className="relative overflow-y-auto overflow-x-hidden select-none bg-[#FCFBFE]"
      >
        <div style={{ height: `${24 * hourHeight}px` }} className="relative w-full">
          {/* Sleep Window Shading (Evening: sleepStart to 24:00) */}
          {sleepStartMin < 1440 && (
            <div
              style={{
                top: `${(sleepStartMin / 60) * hourHeight}px`,
                height: `${((1440 - sleepStartMin) / 60) * hourHeight}px`,
              }}
              className="absolute left-16 right-0 bg-[#F4F3FA]/70 border-y border-[#E8E5F2] pointer-events-none flex items-start p-2"
            >
              <span className="text-[10px] font-bold text-[#8E87A8] flex items-center gap-1 opacity-75">
                <Moon className="w-3 h-3" /> Sleep Window ({sleepStartStr} - 24:00)
              </span>
            </div>
          )}

          {/* Sleep Window Shading (Morning: 00:00 to sleepEnd) */}
          {sleepEndMin > 0 && (
            <div
              style={{
                top: 0,
                height: `${(sleepEndMin / 60) * hourHeight}px`,
              }}
              className="absolute left-16 right-0 bg-[#F4F3FA]/70 border-b border-[#E8E5F2] pointer-events-none flex items-end p-2"
            >
              <span className="text-[10px] font-bold text-[#8E87A8] flex items-center gap-1 opacity-75">
                <Moon className="w-3 h-3" /> Sleep & Recovery (00:00 - {sleepEndStr})
              </span>
            </div>
          )}

          {/* Work Hours Active Zone Shading */}
          <div
            style={{
              top: `${workTopPx}px`,
              height: `${workHeightPx}px`,
            }}
            className="absolute left-16 right-0 bg-gradient-to-b from-[#F5F2FD]/40 to-[#F9F7FE]/40 border-y border-dashed border-[#DCD5F7] pointer-events-none"
          >
            <div className="sticky top-2 left-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#7A68DE] bg-[#FFFFFF]/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-[#E2DCF7] ml-2 mt-1 shadow-xs">
              <Sun className="w-3 h-3 text-[#F4B236]" />
              Work Window ({workStartStr} – {workEndStr})
            </div>
          </div>

          {/* 24 Hourly Grid Lines & Time Axis */}
          {Array.from({ length: 24 }).map((_, hour) => {
            const timeInfo = formatHourLabel(hour);
            const isWorkHour = hour * 60 >= workStartMin && hour * 60 < workEndMin;

            return (
              <div
                key={hour}
                style={{ top: `${hour * hourHeight}px`, height: `${hourHeight}px` }}
                className="absolute left-0 right-0 border-t border-[#EAE7F5] flex"
              >
                {/* Time Axis Column */}
                <div
                  className={`w-16 flex-shrink-0 flex flex-col items-center justify-start pt-1 border-r border-[#EAE7F5] text-[11px] font-mono ${
                    isWorkHour ? 'bg-[#FAF9FD] text-[#6450C7] font-bold' : 'bg-[#FFFFFF] text-[#9AA5B8]'
                  }`}
                >
                  <span className="text-[11px] leading-none">{timeInfo.time24}</span>
                  <span className="text-[9px] text-[#A0AEC0] mt-0.5 leading-none font-sans font-medium">
                    {timeInfo.display.split(' ')[1]}
                  </span>
                </div>

                {/* Grid Slot Area */}
                <div
                  onClick={() => {
                    if (interactiveSlots && onSlotClick) {
                      const slotDate = new Date(targetDate);
                      slotDate.setHours(hour, 0, 0, 0);
                      onSlotClick(slotDate);
                    }
                  }}
                  className={`flex-1 relative cursor-pointer group transition-colors ${
                    isWorkHour ? 'hover:bg-[#ECE9FB]/30' : 'hover:bg-[#F2EFFB]/40'
                  }`}
                >
                  {/* 30-min subtle dashed midline */}
                  <div
                    style={{ top: `${hourHeight / 2}px` }}
                    className="absolute left-0 right-0 border-t border-dashed border-[#F0EDF9] pointer-events-none"
                  />

                  {/* Hover slot quick-add tooltip */}
                  {interactiveSlots && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-2 z-10 pointer-events-none">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8B7BE8] bg-[#FFFFFF] px-2 py-0.5 rounded-lg border border-[#E2DCF7] shadow-xs">
                        <Plus className="w-3 h-3" /> Quick Add @ {timeInfo.time24}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current Time Laser Line (Only if viewing today) */}
          {isToday && (
            <div
              style={{ top: `${currentTimeTopPx}px` }}
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
            >
              {/* Pulsing Time Tag */}
              <div className="w-16 flex items-center justify-center">
                <span className="bg-[#8B7BE8] text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded shadow-button flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                </span>
              </div>
              {/* Glowing Line */}
              <div className="flex-1 h-[2px] bg-gradient-to-r from-[#8B7BE8] via-[#7A68DE] to-[#A092F2] shadow-[0_0_8px_rgba(139,123,232,0.8)] relative">
                <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-[#7A68DE] shadow-xs" />
              </div>
            </div>
          )}

          {/* Render Scheduled Events and Fixed Commitments on Canvas */}
          <div className="absolute left-16 right-3 top-0 bottom-0 pointer-events-none">
            {allDayBlocks.map((block) => {
              const start = new Date(block.startTime);
              const end = new Date(block.endTime);
              const startMins = start.getHours() * 60 + start.getMinutes();
              const endMins = end.getHours() * 60 + end.getMinutes();
              const durationMins = Math.max(15, endMins - startMins || block.allocatedMinutes || 30);

              const topPx = (startMins / 60) * hourHeight;
              const heightPx = Math.max(34, (durationMins / 60) * hourHeight - 3);

              const isCompleted = block.status === 'completed';
              const isFixed = block.isFixedCommitment || block.eventType === 'fixed_commitment';
              const isCurrentActive =
                activeSession &&
                (activeSession.taskId?._id === block.taskId?._id || activeSession.taskId === block.taskId?._id);

              return (
                <div
                  key={block._id}
                  style={{
                    top: `${topPx}px`,
                    height: `${heightPx}px`,
                  }}
                  className={`absolute left-2 right-2 rounded-xl border p-2 pointer-events-auto transition-all shadow-xs group z-20 overflow-hidden flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-[#FAF9FD]/95 border-[#EAE7F5] text-[#9AA5B8] opacity-75'
                      : isFixed
                      ? 'bg-[#FFF5F5] border-[#F7C8C8] text-[#9E3B3B] hover:border-[#E88E8E]'
                      : isCurrentActive
                      ? 'bg-gradient-to-r from-[#ECE9FB] to-[#F5F2FC] border-[#8B7BE8] ring-2 ring-[#C8BFF2] shadow-md'
                      : 'bg-[#FFFFFF] border-[#E2DCF7] hover:border-[#8B7BE8] hover:shadow-card'
                  }`}
                >
                  {/* Top Bar: Time Range + Chunk/Type Badges */}
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {isFixed ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#FDECEC] text-[#9E3B3B] uppercase">
                          <Lock className="w-2.5 h-2.5" /> Fixed
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] font-bold text-[#8B7BE8]">
                          {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} –{' '}
                          {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
                        </span>
                      )}

                      {block.totalChunks > 1 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#ECE9FB] text-[#7A68DE] font-semibold">
                          {block.chunkIndex}/{block.totalChunks}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FAF9FD] text-[#718096] border border-[#EAE7F5] font-bold">
                        {durationMins}m
                      </span>

                      {/* Locked status toggle for scheduled task */}
                      {!isFixed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleLock(block);
                          }}
                          title={block.isLocked ? 'Locked (won’t be rescheduled)' : 'Lock slot'}
                          className={`p-1 rounded hover:bg-[#F2EFFB] transition-colors ${
                            block.isLocked ? 'text-[#8B7BE8]' : 'text-[#A0AEC0] opacity-0 group-hover:opacity-100'
                          }`}
                        >
                          {block.isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        </button>
                      )}

                      {/* Delete event button */}
                      {onDeleteEvent && !isFixed && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteEvent(block._id);
                          }}
                          title="Remove event"
                          className="p-1 rounded text-[#A0AEC0] hover:text-[#E99A9A] hover:bg-[#FDECEC] opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Main Content: Title & Priority Pill */}
                  <div className="my-auto py-0.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex items-center gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          isCompleted
                            ? 'line-through text-[#9AA5B8]'
                            : isFixed
                            ? 'text-[#7B2E2E]'
                            : 'text-[#26324A]'
                        }`}
                      >
                        {block.title}
                      </span>
                    </div>

                    {/* Action buttons (Focus / Complete) */}
                    {!isFixed && !isCompleted && (
                      <div className="flex items-center gap-1 shrink-0">
                        {isCurrentActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#7A68DE] bg-[#ECE9FB] px-2 py-0.5 rounded-lg border border-[#C8BFF2]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#54C497] animate-ping" />
                            Focusing
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onFocusTask(block.taskId?._id || block.taskId, block._id);
                            }}
                            title="Start Focus Session"
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#ECE9FB] hover:bg-[#E0DAF7] text-[#7A68DE] border border-[#D0C6F0] text-[10px] font-bold transition-all shadow-xs"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>Focus</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCompleteEvent(block);
                          }}
                          title="Mark complete"
                          className="p-1 rounded-lg bg-[#FFFFFF] hover:bg-[#E4F7F0] hover:text-[#1E7B58] text-[#718096] border border-[#E5E2F0] transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isCompleted && (
                      <span className="text-[10px] text-[#1E7B58] font-bold flex items-center gap-1 bg-[#E4F7F0] px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty schedule state banner floating over canvas when 0 events */}
          {allDayBlocks.length === 0 && (
            <div className="absolute inset-x-20 top-24 z-10 pointer-events-none">
              <div className="pastel-card p-6 bg-[#FFFFFF]/95 backdrop-blur-md text-center max-w-md mx-auto shadow-popover border-[#D6D0EB] pointer-events-auto space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-[#ECE9FB] text-[#7A68DE] flex items-center justify-center mx-auto shadow-xs">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#26324A]">
                    No Scheduled Sessions for this Day
                  </h4>
                  <p className="text-xs text-[#718096] leading-relaxed">
                    Click any hour slot on the 24-hour grid to place a task block, or let the smart auto-scheduler plan your focus blocks automatically.
                  </p>
                </div>
                {onAutoSchedule && (
                  <button
                    onClick={onAutoSchedule}
                    className="btn-primary-pastel inline-flex items-center gap-2 px-5 py-2 text-xs font-bold shadow-button"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Schedule Full Day</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
