<template>
  <div class="home">
    <nav class="navbar">
      <div class="nav-container">
        <h2 class="nav-title">Calendar App</h2>
        <div class="nav-links">
          <router-link to="/" class="nav-link">Home</router-link>
          <router-link to="/data-grid" class="nav-link">Data Grid</router-link>
        </div>
      </div>
    </nav>
    <h1>Welcome to Calendar App</h1>
    <MyCalendar :events="events" :default-start-hour="8" />
  </div>
</template>

<script setup lang="ts">
import MyCalendar from '../components/MyCalendar.vue';

// Component logic here
const events = [
    { id: 1, title: 'Team Standup', start: new Date(new Date().setHours(9, 0)), end: new Date(new Date().setHours(9, 30)), color: '#FF6B6B' },
    { id: 2, title: 'Project Planning', start: new Date(new Date().setHours(10, 0)), end: new Date(new Date().setHours(10, 30)), color: '#4ECDC4' },
    { id: 3, title: 'Client Meeting', start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(14, 30)), color: '#45B7D1' },
    { id: 4, title: 'Code Review', start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(15, 30)), color: '#96CEB4' },
    { id: 5, title: 'Lunch with Team', start: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(12, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(12, 30)), color: '#FFEEAD' },
    { id: 6, title: 'Product Demo', start: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(16, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(16, 30)), color: '#D4A5A5' },
    { id: 7, title: 'Sprint Retrospective', start: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(10, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(10, 30)), color: '#9B59B6' },
    { id: 8, title: 'Training Session', start: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(13, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(13, 30)), color: '#3498DB' },
    { id: 9, title: 'Team Building', start: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(11, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(11, 30)), color: '#2ECC71' },
    { id: 10, title: 'Budget Review', start: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(15, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(15, 30)), color: '#F1C40F' },
    { id: 11, title: 'Marketing Strategy', start: new Date(new Date().setHours(14, 0)), end: new Date(new Date().setHours(14, 30)), color: '#E67E22' },
    { id: 12, title: 'Design Workshop', start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(9, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(9, 30)), color: '#E74C3C' },
    { id: 13, title: 'QA Testing', start: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(10, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(10, 30)), color: '#1ABC9C' },
    { id: 14, title: 'Performance Review', start: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(14, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(14, 30)), color: '#34495E' },
    { id: 15, title: 'Team Lunch', start: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(12, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(12, 30)), color: '#16A085' },
    { id: 16, title: 'Client Call', start: new Date(new Date().setHours(11, 0)), end: new Date(new Date().setHours(11, 30)), color: '#8E44AD' },
    { id: 17, title: 'Documentation Review', start: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(16, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 1)).setHours(16, 30)), color: '#27AE60' },
    { id: 18, title: 'System Update', start: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(13, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 2)).setHours(13, 30)), color: '#D35400' },
    { id: 19, title: 'Team Sync', start: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(15, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 3)).setHours(15, 30)), color: '#C0392B' },
    { id: 20, title: 'Project Deadline', start: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(16, 0)), end: new Date(new Date(new Date().setDate(new Date().getDate() + 4)).setHours(16, 30)), color: '#2980B9' }
];
</script>

<style scoped>
.home {
  padding: 20px;
}

.navbar {
  background-color: #4d87c7;
  color: white;
  padding: 0.5rem 1rem;
  margin-bottom: 1.5rem;
  border-radius: 6px;
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.nav-title {
  margin: 0;
  font-size: 1.25rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 0;
  position: relative;
}

.nav-link:after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: 0;
  left: 0;
  background-color: white;
  transition: width 0.3s;
}

.nav-link:hover:after {
  width: 100%;
}

.router-link-active:after {
  width: 100%;
}
</style>
