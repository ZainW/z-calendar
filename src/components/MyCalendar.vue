<template>
  <div class="calendar-container">
    <div class="calendar-header">
      <div class="calendar-title">
        <h2>{{ currentMonthName }} {{ currentYear }}</h2>
      </div>
      <div class="calendar-nav">
        <button @click="previousPeriod">Previous</button>
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
        <button @click="nextPeriod">Next</button>
        <button @click="goToToday">Today</button>
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
              'has-events': hasEvents(day.date)
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
          <div class="day-number">{{ day.dayNumber }}</div>
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
                  backgroundColor: event.color
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
import { ref, computed, defineProps } from 'vue';

// Define event type
interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

// Props
const props = defineProps({
  events: {
    type: Array as () => CalendarEvent[],
    required: true,
    default: () => []
  }
});

// State
const view = ref<'month' | 'week'>('month');
const currentDate = ref(new Date());
const selectedDate = ref<Date | null>(null);

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
  const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
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
  return props.events.filter(event => {
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
</script>

<style>
.calendar-container {
  font-family: Arial, sans-serif;
  width: 100%;
  margin: 0 auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e1e1e1;
}

.calendar-nav {
  display: flex;
  gap: 8px;
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
  background: white;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.view-toggle button.active {
  background-color: #1a73e8;
  color: white;
}

button {
  background-color: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #f1f3f4;
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
  font-weight: bold;
  border-bottom: 1px solid #e1e1e1;
}

.weekday {
  padding: 12px;
  color: #70757a;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 120px);
}

.day-cell {
  border: 1px solid #e1e1e1;
  padding: 8px;
  background-color: #f8f9fa;
  overflow: hidden;
  cursor: pointer;
  transition: background-color 0.2s;
}

.day-cell:hover {
  background-color: #f1f3f4;
}

.day-cell.current-month {
  background-color: white;
}

.day-cell.today {
  background-color: #e8f0fe;
}

.day-cell.today .day-number {
  background-color: #1a73e8;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-weight: bold;
  margin-bottom: 4px;
  height: 24px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.events-container {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event {
  font-size: 12px;
  padding: 2px 4px;
  border-radius: 2px;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-events {
  font-size: 12px;
  color: #70757a;
  margin-top: 2px;
}

/* Week View Styles */
.week-view {
  display: flex;
  flex-direction: column;
  height: 800px;
}

.week-header {
  display: flex;
  border-bottom: 1px solid #e1e1e1;
}

.time-column {
  width: 60px;
  border-right: 1px solid #e1e1e1;
}

.day-column-header {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
}

.day-column-header.today {
  background-color: #e8f0fe;
}

.week-body {
  flex: 1;
  position: relative;
  overflow-y: auto;
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
  padding-right: 8px;
  color: #70757a;
  font-size: 12px;
}

.day-columns {
  display: flex;
  flex: 1;
}

.day-column {
  flex: 1;
  position: relative;
  border-right: 1px solid #e1e1e1;
}

.day-column.today {
  background-color: #e8f0fe;
}

.hour-slot {
  height: 60px;
  border-bottom: 1px solid #e1e1e1;
}

.week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 4px;
  border-radius: 4px;
  color: white;
  font-size: 12px;
  overflow: hidden;
}

.event-time {
  font-size: 10px;
  opacity: 0.9;
  margin-top: 2px;
}
</style>