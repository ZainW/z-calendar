<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="calendar-title">
        <h2>{{ currentMonthName }} {{ currentYear }}</h2>
      </div>
      <div class="calendar-nav">
        <button class="icon-button" @click="previousPeriod">&lt;</button>
        <button class="icon-button" @click="nextPeriod">&gt;</button>
        <div class="view-toggle">
          <button
            :class="{ active: view === 'month' }"
            @click="switchView('month')"
          >Month</button>
          <button
            :class="{ active: view === 'week' }"
            @click="switchView('week')"
          >Week</button>
        </div>

        <button class="today-button" @click="goToToday">Today</button>
      </div>
    </div>

    <!-- Month View -->
    <div v-if="view === 'month'" class="month-view">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>
      <div class="days-grid">
        <div
          v-for="(day, index) in daysInMonth"
          :key="index"
          :class="[
            'day-cell',
            {
              'current-month': day.currentMonth,
              'today': isToday(day.date),
              'has-events': hasEvents(day.date),
              'other-month': !day.currentMonth
            }
          ]"
          @click="selectDay(day.date)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          <div class="events-container">
            <template v-for="(event, idx) in eventsForDay(day.date)" :key="idx">
              <div
                v-if="idx < 3"
                class="event"
                :style="{ backgroundColor: event.color }"
              >
                {{ event.title }}
              </div>
            </template>
            <div v-if="eventsForDay(day.date).length > 3" class="more-events">
              +{{ eventsForDay(day.date).length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Week View -->
    <div v-else-if="view === 'week'" class="week-view">
      <div class="week-header">
        <div class="time-column"></div>
        <div
          v-for="(day, index) in currentWeekDays"
          :key="index"
          class="day-column-header"
          :class="{ 'today': isToday(day.date) }"
        >
          <div class="weekday">{{ day.weekday }}</div>
          <div class="day-number" :class="{ 'today-circle': isToday(day.date) }">{{ day.dayNumber }}</div>
        </div>
      </div>
      <div class="week-body">
        <div class="time-slots">
          <div class="time-column">
            <div
              v-for="hour in hours"
              :key="hour"
              class="time-label"
            >
              {{ formatHour(hour) }}
            </div>
          </div>
          <div class="day-columns">
            <div
              v-for="(day, dayIndex) in currentWeekDays"
              :key="dayIndex"
              class="day-column"
              :class="{ 'today': isToday(day.date) }"
            >
              <div
                v-for="hour in hours"
                :key="`${dayIndex}-${hour}`"
                class="hour-slot"
              ></div>
              <div
                v-for="(event, eventIndex) in eventsForDay(day.date)"
                :key="`event-${eventIndex}`"
                class="week-event"
                :style="{
                  top: `${calculateEventTop(event)}px`,
                  height: `${calculateEventHeight(event)}px`,
                  backgroundColor: event.color,
                  borderLeft: `3px solid ${darkenColor(event.color)}`
                }"
              >
                {{ event.title }}
                <div class="event-time">{{ formatEventTime(event) }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, provide } from 'vue';

// Define event type
interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

// Data layer interfaces
interface CalendarFetchOptions {
  start: Date;
  end: Date;
  view: 'month' | 'week';
}

interface CalendarDataSource {
  fetchEvents: (options: CalendarFetchOptions) => Promise<CalendarEvent[]>;
}

interface CalendarCache {
  [key: string]: {
    events: CalendarEvent[];
    timestamp: number;
    expiry: number;
  };
}

// Provide symbols
const CALENDAR_DATA_SOURCE = Symbol('calendarDataSource');

// Props
const props = defineProps({
  events: {
    type: Array as () => CalendarEvent[],
    required: false,
    default: () => []
  },
  dataSource: {
    type: Object as () => CalendarDataSource | null,
    required: false,
    default: null
  },
  cacheExpiry: {
    type: Number,
    required: false,
    default: 5 * 60 * 1000 // 5 minutes in milliseconds
  },
  autoFetch: {
    type: Boolean,
    required: false,
    default: true
  }
});

// Emits
const emit = defineEmits(['update:events', 'fetch-start', 'fetch-success', 'fetch-error']);

// State
const view = ref<'month' | 'week'>('month');
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const localEvents = ref<CalendarEvent[]>([...props.events]);
const isLoading = ref<boolean>(false);
const error = ref<Error | null>(null);
const eventsCache = ref<CalendarCache>({});

// Data source - either injected or from props
const dataSource = computed(() => {
  return props.dataSource || inject(CALENDAR_DATA_SOURCE, null);
});

// Constants
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];
const hours = Array.from({ length: 24 }, (_, i) => i);

// Computed properties
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonthIndex = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() => months[currentMonthIndex.value]);

// Calculate fetch range based on view
const fetchRange = computed(() => {
  const start = new Date(currentDate.value);
  const end = new Date(currentDate.value);

  if (view.value === 'month') {
    // Start from the first day of the month
    start.setDate(1);
    // Get the last day of the displayed month
    end.setMonth(end.getMonth() + 1, 0);

    // Add buffer for days from prev/next month
    const firstDay = new Date(start);
    const prevMonthDays = firstDay.getDay();
    start.setDate(start.getDate() - prevMonthDays);

    const lastDay = new Date(end);
    const nextMonthDays = 6 - lastDay.getDay();
    end.setDate(end.getDate() + nextMonthDays);
  } else {
    // Week view
    const day = start.getDay();
    start.setDate(start.getDate() - day); // First day of week
    end.setDate(end.getDate() + (6 - day)); // Last day of week
  }

  return { start, end };
});

// Generate cache key from date range
function getCacheKey(start: Date, end: Date, view: string): string {
  return `${view}_${start.toISOString()}_${end.toISOString()}`;
}

// Check if we have valid cached data
function hasValidCache(key: string): boolean {
  if (!eventsCache.value[key]) return false;

  const cacheEntry = eventsCache.value[key];
  const now = Date.now();
  return now - cacheEntry.timestamp < cacheEntry.expiry;
}

// Fetch events from data source
async function fetchEvents(): Promise<void> {
  if (!dataSource.value) {
    return;
  }

  const { start, end } = fetchRange.value;
  const cacheKey = getCacheKey(start, end, view.value);

  // Check cache first
  if (hasValidCache(cacheKey)) {
    localEvents.value = eventsCache.value[cacheKey].events;
    return;
  }

  try {
    isLoading.value = true;
    emit('fetch-start', { start, end, view: view.value });

    const fetchOptions: CalendarFetchOptions = {
      start,
      end,
      view: view.value
    };

    const events = await dataSource.value.fetchEvents(fetchOptions);

    // Update cache
    eventsCache.value[cacheKey] = {
      events,
      timestamp: Date.now(),
      expiry: props.cacheExpiry
    };

    localEvents.value = events;
    emit('update:events', events);
    emit('fetch-success', events);
    error.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err : new Error(String(err));
    emit('fetch-error', error.value);
  } finally {
    isLoading.value = false;
  }
}

// Watch for changes that should trigger a new fetch
watch([currentDate, view], () => {
  if (props.autoFetch && dataSource.value) {
    fetchEvents();
  }
}, { immediate: false });

// Watch for changes to props.events
watch(() => props.events, (newEvents) => {
  if (props.events !== localEvents.value) {
    localEvents.value = [...newEvents];
  }
}, { deep: true });

// Public methods to expose
function refreshEvents(): Promise<void> {
  return fetchEvents();
}

// Provide API for child components
provide('calendarApi', {
  refreshEvents,
  isLoading,
  error,
  currentDate,
  view
});

// Lifecycle hooks
onMounted(() => {
  if (props.autoFetch && dataSource.value) {
    fetchEvents();
  }
});

interface DayCell {
  date: Date;
  dayNumber: number;
  currentMonth: boolean;
}

const daysInMonth = computed<DayCell[]>(() => {
  const year = currentYear.value;
  const month = currentMonthIndex.value;
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysCount = lastDayOfMonth.getDate();

  const days: DayCell[] = [];

  // Add days from previous month to fill the first week
  const firstDayWeekday = firstDayOfMonth.getDay();
  const prevMonthLastDay = new Date(year, month, 0).getDate();

  for (let i = 0; i < firstDayWeekday; i++) {
    const dayNumber = prevMonthLastDay - firstDayWeekday + i + 1;
    const date = new Date(year, month - 1, dayNumber);
    days.push({
      date,
      dayNumber,
      currentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysCount; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      dayNumber: i,
      currentMonth: true
    });
  }

  // Add days from next month to complete the last week
  const remainingDays = 35 - days.length; // 5 rows * 7 days = 35
  for (let i = 1; i <= remainingDays; i++) {
    const date = new Date(year, month + 1, i);
    days.push({
      date,
      dayNumber: i,
      currentMonth: false
    });
  }

  return days;
});

interface WeekDay {
  date: Date;
  weekday: string;
  dayNumber: number;
}

const currentWeekDays = computed<WeekDay[]>(() => {
  const currentWeekStart = new Date(currentDate.value);
  const day = currentWeekStart.getDay();
  currentWeekStart.setDate(currentWeekStart.getDate() - day);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(date.getDate() + i);

    return {
      date,
      weekday: weekdays[i],
      dayNumber: date.getDate()
    };
  });
});

// Methods
function switchView(newView: 'month' | 'week'): void {
  view.value = newView;
}

function previousPeriod(): void {
  const date = new Date(currentDate.value);

  if (view.value === 'month') {
    date.setMonth(date.getMonth() - 1);
  } else {
    date.setDate(date.getDate() - 7);
  }

  currentDate.value = date;
}

function nextPeriod(): void {
  const date = new Date(currentDate.value);

  if (view.value === 'month') {
    date.setMonth(date.getMonth() + 1);
  } else {
    date.setDate(date.getDate() + 7);
  }

  currentDate.value = date;
}

function goToToday(): void {
  currentDate.value = new Date();
}

function selectDay(date: Date): void {
  selectedDate.value = date;
  // You could trigger a modal or side panel to show events here
  console.log('Selected date:', date);
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
}

function eventsForDay(date: Date): CalendarEvent[] {
  return localEvents.value.filter(event => {
    const eventDate = new Date(event.start);
    return eventDate.getDate() === date.getDate() &&
           eventDate.getMonth() === date.getMonth() &&
           eventDate.getFullYear() === date.getFullYear();
  });
}

function hasEvents(date: Date): boolean {
  return eventsForDay(date).length > 0;
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return hour < 12 ? `${hour} AM` : `${hour - 12} PM`;
}

function formatEventTime(event: CalendarEvent): string {
  const startHour = event.start.getHours();
  const startMinutes = event.start.getMinutes();
  const endHour = event.end.getHours();
  const endMinutes = event.end.getMinutes();

  const formatTime = (hour: number, minute: number): string => {
    const hourFormat = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${hourFormat}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTime(startHour, startMinutes)} - ${formatTime(endHour, endMinutes)}`;
}

function calculateEventTop(event: CalendarEvent): number {
  const hourHeight = 60; // height in pixels per hour
  const startHour = event.start.getHours();
  const startMinute = event.start.getMinutes();
  return (startHour * hourHeight) + (startMinute / 60 * hourHeight);
}

function calculateEventHeight(event: CalendarEvent): number {
  const hourHeight = 60; // height in pixels per hour
  const startTime = event.start.getHours() + (event.start.getMinutes() / 60);
  const endTime = event.end.getHours() + (event.end.getMinutes() / 60);
  const duration = endTime - startTime;
  return duration * hourHeight;
}

function darkenColor(color: string): string {
  // Simple function to darken a color by 20%
  // For more sophisticated color manipulation, consider using a library
  try {
    // Handle hex colors
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      const darken = (c: number) => Math.max(0, Math.floor(c * 0.8));

      return `#${darken(r).toString(16).padStart(2, '0')}${darken(g).toString(16).padStart(2, '0')}${darken(b).toString(16).padStart(2, '0')}`;
    }
    // For non-hex colors, just return the original
    return color;
  } catch {
    return color;
  }
}

// Expose methods and properties for external usage
defineExpose({
  refreshEvents,
  switchView,
  goToToday,
  previousPeriod,
  nextPeriod,
  selectDay,
  isLoading,
  error,
  currentDate,
  view
});
</script>

<style>
.calendar-container {
  font-family: 'Roboto', 'Arial', sans-serif;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
  color: #3c4043;
  background-color: #fff;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: #fff;
  border-bottom: 1px solid #dadce0;
}

.calendar-title h2 {
  font-size: 22px;
  font-weight: 400;
  margin: 0;
  color: #3c4043;
}

.calendar-nav {
  display: flex;
  gap: 12px;
  align-items: center;
}

.view-toggle {
  display: flex;
  border: 1px solid #dadce0;
  border-radius: 4px;
  overflow: hidden;
}

.view-toggle button {
  border: none;
  background: #fff;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
}

.view-toggle button.active {
  background-color: #1a73e8;
  color: white;
}

button {
  background-color: #fff;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: #3c4043;
}

.icon-button {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 18px;
  border-radius: 50%;
}

.today-button {
  background-color: #1a73e8;
  color: white;
  border: none;
  font-weight: 500;
}

button:hover {
  background-color: #f1f3f4;
}

.today-button:hover {
  background-color: #1967d2;
}

/* Month View Styles */
.month-view {
  display: flex;
  flex-direction: column;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  border-bottom: 1px solid #dadce0;
}

.weekday {
  padding: 10px;
  color: #70757a;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(5, minmax(100px, 1fr));
}

.day-cell {
  border-right: 1px solid #dadce0;
  border-bottom: 1px solid #dadce0;
  padding: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell:hover {
  background-color: #f1f3f4;
}

.day-cell.current-month {
  background-color: #fff;
}

.day-cell.other-month {
  background-color: #f8f9fa;
  color: #70757a;
}

.day-cell.today {
  background-color: #e8f0fe;
}

.day-number {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-cell.today .day-number {
  background-color: #1a73e8;
  color: white;
  border-radius: 50%;
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.event {
  font-size: 12px;
  padding: 3px 6px;
  border-radius: 3px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

.more-events {
  font-size: 12px;
  color: #70757a;
  margin-top: 3px;
  text-align: center;
}

/* Week View Styles */
.week-view {
  display: flex;
  flex-direction: column;
  height: 800px;
}

.week-header {
  display: flex;
  border-bottom: 1px solid #dadce0;
  background-color: #fff;
}

.time-column {
  width: 60px;
  border-right: 1px solid #dadce0;
}

.day-column-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  font-size: 13px;
}

.day-column-header .weekday {
  font-weight: 500;
  color: #70757a;
  padding: 4px 0;
}

.day-column-header .day-number {
  font-weight: 500;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-number.today-circle {
  background-color: #1a73e8;
  color: white;
  border-radius: 50%;
}

.day-column-header.today {
  color: #1a73e8;
}

.week-body {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.time-slots {
  display: flex;
  height: 100%;
}

.time-label {
  height: 60px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 10px;
  color: #70757a;
  font-size: 11px;
  position: relative;
  top: -10px;
}

.day-columns {
  display: flex;
  flex: 1;
}

.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid #dadce0;
}

.day-column:last-child {
  border-right: none;
}

.day-column.today {
  background-color: #fafbff;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #e1e1e1;
}

.hour-slot:nth-child(odd) {
  background-color: #fafafa;
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 4px 8px;
  border-radius: 3px;
  color: white;
  font-size: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 10;
}

.week-event:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  transform: translateY(-1px);
  transition: all 0.2s;
}

.event-time {
  font-size: 10px;
  opacity: 0.85;
  margin-top: 3px;
}
</style>
