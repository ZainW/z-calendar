<template>
  <div class="example-container">
    <h1>MyCalendar Component Example</h1>
    <MyCalendar :events="events" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MyCalendar, type CalendarEvent } from 'my-calendar';
import 'my-calendar/dist/my-calendar.css';

const events = ref<CalendarEvent[]>([
  {
    id: 1,
    title: 'Team Meeting',
    start: new Date(2024, new Date().getMonth(), 15, 10, 0),
    end: new Date(2024, new Date().getMonth(), 15, 11, 30),
    color: '#4CAF50'
  },
  {
    id: 2,
    title: 'Client Call',
    start: new Date(2024, new Date().getMonth(), 16, 14, 0),
    end: new Date(2024, new Date().getMonth(), 16, 15, 0),
    color: '#2196F3'
  },
  {
    id: 3,
    title: 'Project Review',
    start: new Date(2024, new Date().getMonth(), 18, 9, 0),
    end: new Date(2024, new Date().getMonth(), 18, 10, 30),
    color: '#FF9800'
  }
]);
</script>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 20px;
  color: #333;
}
</style>
