<script setup lang="ts">
import MyCalendar from '../components/MyCalendar.vue';
import { ref } from 'vue';

// Define event type
interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

// Sample events data
const events = ref<CalendarEvent[]>([
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(new Date().setHours(10, 0)),
    end: new Date(new Date().setHours(11, 30)),
    color: '#4285F4'
  },
  {
    id: 2,
    title: 'Lunch with Client',
    start: new Date(new Date().setHours(12, 30)),
    end: new Date(new Date().setHours(13, 30)),
    color: '#0F9D58'
  },
  {
    id: 3,
    title: 'Project Deadline',
    start: new Date(new Date().setDate(new Date().getDate() + 2)),
    end: new Date(new Date().setDate(new Date().getDate() + 2)),
    color: '#DB4437'
  },
  {
    id: 4,
    title: 'Conference Call',
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: '#F4B400'
  },
  {
    id: 5,
    title: 'All-day workshop',
    start: new Date(new Date().setDate(new Date().getDate() + 4)),
    end: new Date(new Date().setDate(new Date().getDate() + 4)),
    color: '#4285F4'
  }
]);
</script>

<template>
  <div class="home">
    <MyCalendar :events="events" />
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
}
</style>
