<script setup lang="ts">
import { ref, computed, watch, defineProps, defineEmits } from 'vue';

interface DayObject {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
}

const props = defineProps<{
  currentDate: Date;
  selectedDate: Date | null;
}>();

const emit = defineEmits(['date-selected', 'navigate-month']);

const displayMonth = ref(new Date(props.currentDate)); // Initialize with current month from main calendar

const weekdays = Array.from({ length: 7 }, (_, i) => {
  const date = new Date(2021, 0, i + 3); // Jan 3, 2021 was a Sunday
  return new Intl.DateTimeFormat(undefined, { weekday: 'narrow' }).format(date);
});

const formattedMonthYear = computed(() => {
  return displayMonth.value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
});

function isSameDay(date1: Date, date2: Date | null): boolean {
  if (!date2) return false;
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}

const daysGrid = computed<DayObject[]>(() => {
  const days: DayObject[] = [];
  const year = displayMonth.value.getFullYear();
  const month = displayMonth.value.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);

  // Start date is the Sunday of the week the first day of the month falls in
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfMonth.getDay()); // .getDay() is 0 for Sun, 1 for Mon...

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const currentDatePointer = new Date(startDate);
    currentDatePointer.setDate(startDate.getDate() + i);

    days.push({
      date: new Date(currentDatePointer),
      dayNumber: currentDatePointer.getDate(),
      isCurrentMonth: currentDatePointer.getMonth() === month,
      isToday: isSameDay(currentDatePointer, new Date()),
      isSelected: isSameDay(currentDatePointer, props.selectedDate),
    });
  }
  return days;
});

function prevMonth() {
  displayMonth.value = new Date(displayMonth.value.getFullYear(), displayMonth.value.getMonth() - 1, 1);
  emit('navigate-month', new Date(displayMonth.value));
}

function nextMonth() {
  displayMonth.value = new Date(displayMonth.value.getFullYear(), displayMonth.value.getMonth() + 1, 1);
  emit('navigate-month', new Date(displayMonth.value));
}

function selectDay(day: DayObject) {
  // Emit date-selected for the main calendar to pick up
  // The main calendar can decide if it wants to navigate months if day is not in current month
  emit('date-selected', day.date);

  // If a day from another month is clicked, also navigate the mini-calendar to that month
  if (!day.isCurrentMonth) {
    displayMonth.value = new Date(day.date.getFullYear(), day.date.getMonth(), 1);
    // No need to emit 'navigate-month' here if the main calendar handles month changes based on 'date-selected'
    // However, if mini-calendar should independently signal month navigation on such clicks:
    // emit('navigate-month', new Date(displayMonth.value));
  }
}

watch(() => props.currentDate, (newVal) => {
  // Update displayMonth if the main calendar's month changes,
  // but avoid feedback loop if mini-calendar initiated the change.
  if (newVal.getFullYear() !== displayMonth.value.getFullYear() ||
      newVal.getMonth() !== displayMonth.value.getMonth()) {
    displayMonth.value = new Date(newVal);
  }
}, { immediate: true }); // Use immediate to set initial displayMonth correctly based on prop


</script>

<template>
  <div class="mini-calendar">
    <div class="mini-calendar-header">
      <button @click="prevMonth" class="nav-button prev-month" aria-label="Previous month">&lt;</button>
      <span class="month-year">{{ formattedMonthYear }}</span>
      <button @click="nextMonth" class="nav-button next-month" aria-label="Next month">&gt;</button>
    </div>
    <div class="mini-calendar-weekdays">
      <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
    </div>
    <div class="mini-calendar-grid">
      <div
        v-for="(day, index) in daysGrid"
        :key="`${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`"
        class="day-cell"
        :class="{
          'other-month': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.isSelected,
        }"
        @click="selectDay(day)"
        role="button"
        :aria-label="`Select date ${day.date.toDateString()}`"
        :aria-selected="day.isSelected"
        tabindex="0"
        @keydown.enter="selectDay(day)" @keydown.space="selectDay(day)"
      >
        {{ day.dayNumber }}
      </div>
  </div>
</template>

<style scoped>
.mini-calendar {
  width: 220px; /* Adjusted width */
  padding: 8px;
  background-color: #fff;
  border: 1px solid #e0e0e0; /* Softer border */
  border-radius: 6px; /* Slightly more rounded */
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.mini-calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px; /* Reduced margin */
  padding: 4px 0;
}

.month-year {
  font-weight: 600; /* Slightly bolder */
  font-size: 0.95em; /* Adjusted size */
  color: #333;
}

.nav-button {
  width: 36px;
  aspect-ratio: 1 / 1;
  height: auto;
  min-width: 0;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 1.1em;
  color: #555;
  transition: background-color 0.2s;
  padding: 0;
  box-sizing: border-box;
}
.nav-button:hover {
  background-color: #f0f0f0; /* Hover effect */
  color: #111;
}

.mini-calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 6px; /* Adjusted margin */
  font-size: 0.75em; /* Smaller weekday text */
  font-weight: 500;
  color: #777; /* Greyer weekday text */
}
.mini-calendar-weekdays span {
  padding: 2px 0;
}

.mini-calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px; /* Reduced gap for tighter grid */
}

.day-cell {
  width: 30px;
  aspect-ratio: 1 / 1;
  height: auto;
  min-width: 0;
  min-height: 0;
  padding: 0;
  text-align: center;
  border: 1px solid transparent;
  font-size: 0.85em;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s, border-color 0.2s;
  color: #444;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.day-cell:hover {
  background-color: #e9eff8; /* Light blue hover */
  border-color: #d0d8e0;
}
.day-cell:focus, .day-cell:focus-visible {
  outline: 2px solid #1a73e8;
  outline-offset: 1px;
}


.day-cell.other-month {
  color: #aaa; /* Lighter text for other month days */
}
.day-cell.other-month:hover {
  background-color: #f4f4f4;
}

.day-cell.today {
  font-weight: bold;
.day-cell.today {
  font-weight: bold;
  background-color: #ebf4ff; /* Light blue background for today */
  border: 1px solid #cce0ff; /* Slightly darker blue border for today */
  color: #005fc9; /* Darker blue text for today */
}
  border: 1px solid #cce0ff; /* Slightly darker blue border for today */
  color: #005fc9; /* Darker blue text for today */
}
.day-cell.today:hover {
  background-color: #ddeafd;
}

.day-cell.selected {
  background-color: #1a73e8; /* Blue background for selected */
  color: white;
  border-color: #1a73e8;
  font-weight: bold;
}
.day-cell.selected:hover {
  background-color: #145cb7; /* Darker blue on hover for selected */
  border-color: #145cb7;
}

/* Ensure selected today has distinct styling if needed, but selected usually overrides today visual */
.day-cell.selected.today {
  background-color: #1a73e8; /* Standard selected style */
  color: white;
  border-color: #1a73e8;
}
.day-cell.selected.today:hover {
   background-color: #145cb7;
   border-color: #145cb7;
}
</style>
