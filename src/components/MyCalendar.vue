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
          <button
            :class="{ active: view === 'day' }"
            @click="switchView('day')"
          >Day</button>
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
              'other-month': !day.currentMonth,
              'drag-over': isDraggingOver(day.date)
            }
          ]"
          @click="selectDay(day.date)"
          @dragover.prevent="onDragOver($event, day.date)"
          @dragleave.prevent="onDragLeave()"
          @drop.prevent="onDayDrop($event, day.date)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          <div class="events-container">
            <template v-for="(event, idx) in eventsForDay(day.date)" :key="idx">
              <div
                v-if="idx < 3"
                class="event"
                :style="{
                  backgroundColor: getEventBackground(event.color),
                  borderLeft: `3px solid ${event.color}`
                }"
                draggable="true"
                @dragstart="onEventDragStart($event, event)"
                @dragend="onDragEnd()"
                @click.stop="openEventCard(event, $event.currentTarget as HTMLElement)"
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
        <div class="day-columns">
          <div v-for="day in currentWeekDays" :key="day.date.toISOString()" class="day-column">
            <div class="day-column-header">
              <div class="weekday">{{ day.weekday }}</div>
              <div class="day-number" :class="{ 'today': isToday(day.date) }">
                {{ day.dayNumber }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref="weekBodyRef" class="week-body">
        <div class="time-slots">
          <div class="time-label">
            <div v-for="hour in 24" :key="hour-1">
              {{ formatHour(hour - 1) }}
            </div>
          </div>
          <div class="hour-slots">
            <div v-for="day in currentWeekDays" :key="day.date.toISOString()" class="hour-column">
              <div v-for="hour in 24" :key="hour" class="hour-slot"></div>
              <div
                v-if="isToday(day.date)"
                class="current-time-indicator"
                :style="{ top: `${getCurrentTimePosition()}px` }"
              ></div>
              <template v-for="event in eventsForDay(day.date)" :key="event.id">
                <div
                  class="week-event"
                  :style="{
                    top: `${calculateEventTop(event)}px`,
                    height: `${calculateEventHeight(event)}px`,
                    backgroundColor: getEventBackground(event.color),
                    borderLeft: `3px solid ${event.color}`,
                    ...calculateEventPosition(event, eventsForDay(day.date))
                  }"
                  @click="openEventCard(event, $event.currentTarget as HTMLElement)"
                >
                  <div class="event-content">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-time">{{ formatEventTime(event) }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day View -->
    <div v-else-if="view === 'day'" class="day-view">
      <div class="day-header">
        <div class="time-column day-time-column"></div>
        <div class="day-column-wrapper">
          <div class="day-column-header">
            <div class="day-weekday">{{ currentDayName }}</div>
            <div class="day-number" :class="{ 'today': isToday(currentDate) }">
              {{ currentDate.getDate() }}
            </div>
          </div>
        </div>
      </div>
      <div ref="dayBodyRef" class="day-body">
        <div class="day-time-slots">
          <div class="time-label day-time-label">
            <div v-for="hour in 24" :key="hour-1">
              {{ formatHour(hour - 1) }}
            </div>
          </div>
          <div class="day-hour-slots">
            <div class="day-hour-column">
              <div v-for="hour in 24" :key="hour" class="day-hour-slot"></div>
              <div
                v-if="isToday(currentDate)"
                class="current-time-indicator day-current-time-indicator"
                :style="{ top: `${getCurrentTimePosition()}px` }"
              ></div>
              <template v-for="event in eventsForDay(currentDate)" :key="event.id">
                <div
                  class="day-event"
                  :style="{
                    top: `${calculateEventTop(event)}px`,
                    height: `${calculateEventHeight(event)}px`,
                    backgroundColor: getEventBackground(event.color),
                    borderLeft: `3px solid ${event.color}`
                  }"
                  @click="openEventCard(event, $event.currentTarget as HTMLElement)"
                >
                  <div class="event-content">
                    <div class="event-title">{{ event.title }}</div>
                    <div class="event-time">{{ formatEventTime(event) }}</div>
                    <div class="event-description" v-if="event.description">{{ event.description }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Card -->
    <EventCard
      :event="selectedEvent"
      :is-open="isEventCardOpen"
      :reference-el="selectedEventEl"
      @close="closeEventCard"
      @reschedule="rescheduleEvent"
      @cancel="cancelEvent"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, inject, provide, nextTick } from 'vue';
import EventCard from './EventCard.vue';
import {
  type CalendarEvent,
  type CalendarDataSource,
  type CalendarFetchOptions,
  moveEventToDate,
} from '../utils/calendarDataProvider';

// Define event type
// Removed redundant CalendarEvent interface definition

// Data layer interfaces
// Removed redundant CalendarFetchOptions and CalendarDataSource interface definitions

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
  },
  defaultStartHour: {
    type: Number,
    required: false,
    default: 8, // 8 AM default
    validator: (value: number) => value >= 0 && value < 24
  }
});

// Emits
const emit = defineEmits(['update:events', 'fetch-start', 'fetch-success', 'fetch-error', 'event-updated', 'event-added', 'event-deleted']); // Added event emits

// State
const view = ref<'month' | 'week' | 'day'>('month');
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);
const localEvents = ref<CalendarEvent[]>([...props.events]);
const isLoading = ref<boolean>(false);
const error = ref<Error | null>(null);
const eventsCache = ref<CalendarCache>({});

// Drag and Drop State
const draggingEvent = ref<CalendarEvent | null>(null);
const dragOverDate = ref<Date | null>(null);

// Event Card State
const selectedEventEl = ref<HTMLElement | null>(null);
const selectedEvent = ref<CalendarEvent | null>(null);
const isEventCardOpen = ref(false);

// Data source - either injected or from props
const dataSource = computed(() => {
  return props.dataSource || inject(CALENDAR_DATA_SOURCE, null);
});

// Constants
const months = [
  'January', 'February', 'March',
  'April', 'May', 'June',
  'July', 'August', 'September',
  'October', 'November', 'December'
];

// Get localized weekday names - start from Sunday (0) instead of Monday
const weekdays = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(2024, 0, i); // Start from index 0 for Sunday
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
});

// Computed properties
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonthIndex = computed(() => currentDate.value.getMonth());
const currentMonthName = computed(() => months[currentMonthIndex.value]);

// Add computed property for the current day name
const currentDayName = computed(() => {
  const date = new Date(currentDate.value);
  return new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date);
});

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
  } else if (view.value === 'week') {
    // Week view
    const day = start.getDay();
    start.setDate(start.getDate() - day); // First day of week
    end.setDate(end.getDate() + (6 - day)); // Last day of week
  } else if (view.value === 'day') {
    // Day view - just the current day
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
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
  // No need to adjust firstDayWeekday since Sunday is already 0
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
  const gridCellsNeeded = Math.ceil((firstDayWeekday + daysCount) / 7) * 7;
  const remainingDays = gridCellsNeeded - days.length;
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
  currentWeekStart.setDate(currentWeekStart.getDate() - day); // No adjustment needed since Sunday is 0

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
function switchView(newView: 'month' | 'week' | 'day'): void {
  view.value = newView;
}

function previousPeriod(): void {
  const date = new Date(currentDate.value);

  if (view.value === 'month') {
    date.setMonth(date.getMonth() - 1);
  } else if (view.value === 'week') {
    date.setDate(date.getDate() - 7);
  } else if (view.value === 'day') {
    date.setDate(date.getDate() - 1);
  }

  currentDate.value = date;
}

function nextPeriod(): void {
  const date = new Date(currentDate.value);

  if (view.value === 'month') {
    date.setMonth(date.getMonth() + 1);
  } else if (view.value === 'week') {
    date.setDate(date.getDate() + 7);
  } else if (view.value === 'day') {
    date.setDate(date.getDate() + 1);
  }

  currentDate.value = date;
}

function goToToday(): void {
  currentDate.value = new Date();
}

function selectDay(date: Date): void {
  selectedDate.value = date;
  // Open card to create a new event for this day
  openEventCard(null, null);
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
  }).sort((a, b) => a.start.getTime() - b.start.getTime());
}

function hasEvents(date: Date): boolean {
  return eventsForDay(date).length > 0;
}

function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  return `${hour % 12} ${hour < 12 ? 'AM' : 'PM'}`;
}

function formatEventTime(event: CalendarEvent): string {
  const startHour = event.start.getHours();
  const startMinutes = event.start.getMinutes();
  const endHour = event.end.getHours();
  const endMinutes = event.end.getMinutes();

  const formatTime = (hour: number, minute: number): string => {
    const hourFormat = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const period = hour >= 12 ? 'PM' : 'AM';
    return `${hourFormat}${minute > 0 ? ':' + minute.toString().padStart(2, '0') : ''} ${period}`;
  };

  return `${formatTime(startHour, startMinutes)} - ${formatTime(endHour, endMinutes)}`;
}

function calculateEventTop(event: CalendarEvent): number {
  const hours = event.start.getHours();
  const minutes = event.start.getMinutes();
  return (hours * 60 + minutes); // Subtract 60 to account for the time label offset
}

function calculateEventHeight(event: CalendarEvent): number {
  const duration = event.end.getTime() - event.start.getTime();
  const minutes = duration / (1000 * 60);
  return Math.max(minutes, 45); // Minimum height of 45px to prevent text cutoff
}

function calculateEventPosition(event: CalendarEvent, allDayEvents: CalendarEvent[]): { left: string, width: string } {
  const overlappingEvents = allDayEvents.filter(e => {
    return e.start < event.end && e.end > event.start;
  });

  const index = overlappingEvents.indexOf(event);
  const totalOverlap = overlappingEvents.length;

  if (totalOverlap <= 1) {
    return { left: '1%', width: '98%' };
  }

  const width = Math.min(95, (98 / totalOverlap)); // Max width of 95%, min gap of 2%
  const left = (index * (100 - width)) / (totalOverlap - 1);

  return {
    left: `${left}%`,
    width: `${width}%`
  };
}

function getEventBackground(color: string): string {
  try {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }
    return color;
  } catch {
    return '#f8f9fa';
  }
}

// --- Drag and Drop Methods ---
function onEventDragStart(event: DragEvent, calendarEvent: CalendarEvent) {
  if (event.dataTransfer) {
    event.dataTransfer.setData('text/plain', String(calendarEvent.id));
    event.dataTransfer.effectAllowed = 'move';
  }
  draggingEvent.value = calendarEvent;
}

function onDragOver(event: DragEvent, date: Date) {
  event.preventDefault(); // Necessary to allow drop
  dragOverDate.value = date;
}

function onDragLeave() {
  dragOverDate.value = null;
}

function onDragEnd() {
  draggingEvent.value = null;
  dragOverDate.value = null;
}

function isDraggingOver(date: Date): boolean {
  return !!dragOverDate.value &&
         dragOverDate.value.toDateString() === date.toDateString();
}

function onDayDrop(event: DragEvent, date: Date) {
  event.preventDefault();
  if (draggingEvent.value) {
    const movedEvent = moveEventToDate(draggingEvent.value, date);
    openEventCard(movedEvent, null);
  }
  onDragEnd();
}

// --- Event Management Methods ---
function openEventCard(event: CalendarEvent | null, element: HTMLElement | null) {
  selectedEvent.value = event;
  selectedEventEl.value = element;
  isEventCardOpen.value = true;
}

function closeEventCard() {
  isEventCardOpen.value = false;
  selectedEvent.value = null;
  selectedEventEl.value = null;
}

function deleteLocalEvent(id: string | number) {
  const index = localEvents.value.findIndex(e => e.id === id);
  if (index !== -1) {
    const [removed] = localEvents.value.splice(index, 1);
    emit('event-deleted', removed);
    emit('update:events', [...localEvents.value]);
    return removed;
  }
  return null;
}

function rescheduleEvent() {
  if (selectedEvent.value) {
    // Here you would typically show a date picker or some UI to select new time
    // For now, we'll just close the card
    closeEventCard();
  }
}

function cancelEvent() {
  if (selectedEvent.value) {
    deleteLocalEvent(selectedEvent.value.id);
  }
  closeEventCard();
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
  view,
  openEventCard, // Expose modal opener
  calculateEventHeight,
  calculateEventTop
});

// Add getCurrentTimePosition function
function getCurrentTimePosition(): number {
  const now = new Date();
  return (now.getHours() * 60) + now.getMinutes() + 60;
}

// Reference for the week body container
const weekBodyRef = ref<HTMLElement | null>(null);

// Reference for the day body container
const dayBodyRef = ref<HTMLElement | null>(null);

// Scroll to default hour
function scrollToHour(hour: number) {
  if (weekBodyRef.value) {
    const pixelsPerHour = 60; // height of each hour slot
    const scrollTop = hour * pixelsPerHour;
    weekBodyRef.value.scrollTop = scrollTop;
  }
}

// Watch for view changes to apply scroll position
watch(view, (newView) => {
  if (newView === 'week') {
    // Use nextTick to ensure the DOM is updated
    nextTick(() => {
      scrollToHour(props.defaultStartHour);
    });
  } else if (newView === 'day') {
    // Use nextTick to ensure the DOM is updated
    nextTick(() => {
      scrollToHour(props.defaultStartHour);
    });
  }
});

// Apply initial scroll position when mounted
onMounted(() => {
  if (view.value === 'week') {
    scrollToHour(props.defaultStartHour);
  } else if (view.value === 'day') {
    scrollToHour(props.defaultStartHour);
  }
});
</script>

<style>
.calendar-container {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  width: 100%;
  background-color: #fff;
  color: #333;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Add font-family to all text elements */
.calendar-title h2,
.icon-button,
.view-toggle button,
.today-button,
.weekday,
.day-number,
.event,
.more-events,
.event-title,
.event-time,
.time-label > div {
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Specific font weights */
.calendar-title h2,
.day-column-header .day-number.today,
.event-title {
  font-weight: 500;
}

.view-toggle button.active,
.today-button {
  font-weight: 500;
}

.weekday,
.event-time {
  font-weight: 400;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #dadce0;
}

.calendar-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.calendar-title h2 {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.calendar-nav {
  display: flex;
  gap: 8px;
  align-items: center;
}

.icon-button {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 18px;
  border: none;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.icon-button:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
}

.view-toggle {
  display: flex;
  gap: 0;
  margin: 0 8px;
}

.view-toggle button {
  padding: 6px 16px;
  font-size: 14px;
  border: 1px solid #dadce0;
  background: white;
  color: #333;
  cursor: pointer;
}

.view-toggle button:first-child {
  border-radius: 4px 0 0 4px;
  border-right: none;
}

.view-toggle button:last-child {
  border-radius: 0 4px 4px 0;
}

.view-toggle button.active {
  background-color: #1a73e8;
  color: white;
  border-color: #1a73e8;
}

.today-button {
  padding: 6px 16px;
  font-size: 14px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  background: white;
  color: #333;
  cursor: pointer;
}

/* Month View Styles */
.month-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  border-bottom: 1px solid #dadce0;
  padding: 0;
}

.weekday {
  padding: 12px 0;
  color: #70757a;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(100px, 1fr);
  flex: 1;
}

.day-cell {
  border-right: 1px solid #dadce0;
  border-bottom: 1px solid #dadce0;
  padding: 8px;
  overflow: hidden;
}

.day-cell:nth-child(7n) {
  border-right: none;
}

.day-cell.other-month {
  background-color: #f8f9fa;
  color: #70757a;
}

.day-cell .day-number {
  font-size: 12px;
  margin-bottom: 4px;
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
  gap: 2px;
}

.event {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 1px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.event:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.more-events {
  font-size: 12px;
  color: #70757a;
  padding: 2px 8px;
  margin-top: 2px;
}

/* Week View Styles */
.week-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 120px);
}

.week-header {
  display: flex;
  border-bottom: 1px solid #dadce0;
  background: white;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  height: 60px;
  align-items: center;
  margin-bottom: 0;
  padding: 0;
}

.time-column {
  width: 50px;
  flex-shrink: 0;
  border-right: 1px solid #dadce0;
  background: white;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.day-columns {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  flex: 1;
  background: white;
  height: 100%;
}

.day-column {
  border-right: 1px solid #dadce0;
  min-width: 0;
  background: white;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-column:last-child {
  border-right: none;
}

.day-column-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: transparent;
  padding: 0;
  gap: 2px;
}

.day-column-header .weekday {
  font-size: 11px;
  color: #70757a;
  text-transform: uppercase;
  font-weight: 500;
}

.day-column-header .day-number {
  font-size: 20px;
  color: #333;
  font-weight: 400;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s, color 0.2s;
}

.day-column-header .day-number.today {
  background-color: #1a73e8;
  color: white;
  font-weight: 500;
}

.week-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  scroll-behavior: smooth;
  margin-top: 0;
  background: #fff;
}

/* Hide scrollbar but keep functionality */
.week-body::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.week-body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.time-slots {
  display: flex;
  min-height: 1440px; /* 24 hours * 60px */
  width: 100%;
  position: relative;
  background: white;
  margin-top: 0;
}

.time-label {
  width: 50px;
  flex-shrink: 0;
  border-right: 1px solid #dadce0;
  background: white;
  z-index: 2;
  padding: 0;
  text-align: right;
  position: sticky;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.time-label > div {
  height: 60px;
  padding-right: 8px;
  text-align: right;
  font-size: 10px;
  color: #70757a;
  position: relative;
  top: 0;
  border-top: 1px solid #dadce0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.hour-slots {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  position: relative;
  min-height: 1440px;
  background: #fff;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #dadce0;
  position: relative;
  min-height: 60px;
  box-sizing: border-box;
  background: #fff;
}

.hour-slot:last-child {
  border-bottom: none;
}

.week-event {
  position: absolute;
  padding: 6px 8px;
  font-size: 12px;
  color: #333;
  overflow: hidden;
  z-index: 2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  margin: 0 1px;
  min-height: 35px;
  width: calc(100% - 4px);
  left: 2px;
}

.week-event:hover {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  z-index: 4;
}

.event-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 3px;
}

.event-title {
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  margin-bottom: 2px;
}

.event-time {
  font-size: 11px;
  line-height: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #5f6368;
  opacity: 0.9;
}

.current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ea4335;
  z-index: 3;
  transform: translateY(-1px);
}

.current-time-indicator::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  background-color: #ea4335;
  border-radius: 50%;
}

.hour-column {
  border-right: 1px solid #dadce0;
  min-width: 0;
  position: relative;
  overflow: visible;
  background: #fff;
}

.hour-column:last-child {
  border-right: none;
}

/* Day View Styles */
.day-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: calc(100vh - 120px);
}

.day-header {
  display: flex;
  border-bottom: 1px solid #dadce0;
  background: white;
  flex-shrink: 0;
  position: relative;
  z-index: 3;
  height: 60px;
  align-items: center;
  margin-bottom: 0;
  padding: 0;
}

.day-time-column {
  width: 50px;
  flex-shrink: 0;
  border-right: 1px solid #dadce0;
  background: white;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.day-column-wrapper {
  display: flex;
  flex: 1;
  background: white;
  height: 100%;
  justify-content: center;
}

.day-column-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: transparent;
  padding: 0;
  gap: 2px;
}

.day-column-header .day-weekday {
  font-size: 16px;
  color: #5f6368;
  font-weight: 500;
}

.day-column-header .day-number {
  font-size: 24px;
  color: #333;
  font-weight: 400;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s, color 0.2s;
}

.day-column-header .day-number.today {
  background-color: #1a73e8;
  color: white;
  font-weight: 500;
}

.day-body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  display: flex;
  scroll-behavior: smooth;
  margin-top: 0;
  background: #fff;
}

/* Hide scrollbar but keep functionality */
.day-body::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

.day-body {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.day-time-slots {
  display: flex;
  min-height: 1440px; /* 24 hours * 60px */
  width: 100%;
  position: relative;
  background: white;
  margin-top: 0;
}

.day-time-label {
  width: 50px;
  flex-shrink: 0;
  border-right: 1px solid #dadce0;
  background: white;
  z-index: 2;
  padding: 0;
  text-align: right;
  position: sticky;
  left: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.day-time-label > div {
  height: 60px;
  padding-right: 8px;
  text-align: right;
  font-size: 10px;
  color: #70757a;
  position: relative;
  top: 0;
  border-top: 1px solid #dadce0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.day-hour-slots {
  flex: 1;
  display: flex;
  position: relative;
  min-height: 1440px;
  background: #fff;
}

.day-hour-column {
  flex: 1;
  position: relative;
}

.day-hour-slot {
  height: 60px;
  border-bottom: 1px solid #dadce0;
  position: relative;
  min-height: 60px;
  box-sizing: border-box;
  background: #fff;
}

.day-hour-slot:last-child {
  border-bottom: none;
}

.day-event {
  position: absolute;
  left: 8px;
  right: 8px;
  padding: 8px 10px;
  font-size: 14px;
  color: #333;
  overflow: hidden;
  z-index: 2;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  min-height: 45px;
}

.day-event:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  z-index: 4;
}

.day-event .event-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;
}

.day-event .event-title {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #333;
  margin-bottom: 2px;
}

.day-event .event-time {
  font-size: 12px;
  line-height: 16px;
  color: #5f6368;
  opacity: 0.9;
}

.day-event .event-description {
  font-size: 12px;
  line-height: 16px;
  color: #5f6368;
  margin-top: 4px;
  overflow: hidden;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.day-current-time-indicator {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #ea4335;
  z-index: 3;
  transform: translateY(-1px);
}

.day-current-time-indicator::before {
  content: '';
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  background-color: #ea4335;
  border-radius: 50%;
}
</style>
