<template>
  <div class="example-container">
    <h1>Calendar Component Example</h1>

    <!-- Example with Static Events -->
    <div class="example-section">
      <h2>Static Events</h2>
      <MyCalendar :events="staticEvents" />
    </div>

    <!-- Example with Fetch-based Data Source -->
    <div class="example-section">
      <h2>Data Source with Fetch (Simulated API)</h2>
      <div class="controls">
        <button @click="refreshFetchCalendar">Refresh Events</button>
        <span v-if="isLoading" class="loading-indicator">Loading...</span>
        <span v-if="error" class="error-message">Error: {{ error.message }}</span>
      </div>
      <MyCalendar
        ref="fetchCalendar"
        :data-source="apiDataSource"
      />
    </div>

    <!-- Example with Calendar Store -->
    <div class="example-section">
      <h2>Calendar Store with CRUD</h2>
      <div class="controls">
        <button @click="addRandomEvent">Add Random Event</button>
        <button v-if="selectedEvent" @click="updateSelectedEvent">Update Selected Event</button>
        <button v-if="selectedEvent" @click="deleteSelectedEvent">Delete Selected Event</button>
      </div>
      <div v-if="selectedEvent" class="selected-event">
        <h3>Selected Event: {{ selectedEvent.title }}</h3>
        <p>{{ formatEventDetails(selectedEvent) }}</p>
      </div>
      <MyCalendar
        :data-source="storeDataSource"
        @update:events="handleEventsUpdate"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import MyCalendar from '../components/MyCalendar.vue';
import {
  createFetchDataSource,
  useCalendarStore,
  createEvent,
  type CalendarEvent
} from '../utils/calendarDataProvider';

// Static events example
const staticEvents = ref<CalendarEvent[]>([
  createEvent({
    id: 1,
    title: 'Meeting with Team',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 30, 0, 0)),
    color: '#4285F4'
  }),
  createEvent({
    id: 2,
    title: 'Lunch with Client',
    start: new Date(new Date().setHours(13, 0, 0, 0)),
    end: new Date(new Date().setHours(14, 0, 0, 0)),
    color: '#EA4335'
  }),
  createEvent({
    id: 3,
    title: 'Product Review',
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    color: '#34A853'
  })
]);

// Fetch-based example with simulated API
const fetchCalendar = ref<InstanceType<typeof MyCalendar> | null>(null);
const isLoading = ref(false);
const error = ref<Error | null>(null);

// Simulated API fetch function
async function fetchEventsFromAPI(start: Date, end: Date): Promise<CalendarEvent[]> {
  isLoading.value = true;
  error.value = null;

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Generate some random events in the date range
    const events: CalendarEvent[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      // 30% chance to create an event on this day
      if (Math.random() < 0.3) {
        const eventDate = new Date(currentDate);

        // Random hour between 9 and 17
        const hour = Math.floor(Math.random() * 8) + 9;
        eventDate.setHours(hour, 0, 0, 0);

        const eventEndDate = new Date(eventDate);
        // Duration between 30 minutes and 2 hours
        const durationHours = Math.random() * 1.5 + 0.5;
        eventEndDate.setHours(eventEndDate.getHours() + Math.floor(durationHours));
        eventEndDate.setMinutes(eventEndDate.getMinutes() + ((durationHours % 1) * 60));

        events.push(createEvent({
          title: `Event on ${eventDate.toLocaleDateString()}`,
          start: eventDate,
          end: eventEndDate
        }));
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return events;
  } catch (e) {
    const err = e instanceof Error ? e : new Error('Failed to fetch events');
    error.value = err;
    throw err;
  } finally {
    isLoading.value = false;
  }
}

// Create data source from the fetch function
const apiDataSource = createFetchDataSource(fetchEventsFromAPI);

// Refresh function for the fetch-based calendar
function refreshFetchCalendar() {
  if (fetchCalendar.value) {
    fetchCalendar.value.refreshEvents();
  }
}

// Calendar store example with CRUD operations
const {
  dataSource: storeDataSource,
  addEvent,
  updateEvent,
  deleteEvent,
} = useCalendarStore({
  // Initial events
  initialEvents: [
    createEvent({
      id: 'store-1',
      title: 'Project Kickoff',
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(10, 30, 0, 0))
    }),
    createEvent({
      id: 'store-2',
      title: 'Weekly Review',
      start: new Date(new Date().setDate(new Date().getDate() + 2)),
      end: new Date(new Date().setDate(new Date().getDate() + 2))
    })
  ]
});

// Event selection
const selectedEvent = ref<CalendarEvent | null>(null);

function handleEventsUpdate(events: CalendarEvent[]) {
  // This is just for demonstration - we don't need to do anything here
  // since the store is already managing the events
  console.log('Events updated:', events);
}

// Add a random event to the store
function addRandomEvent() {
  const today = new Date();
  const daysAhead = Math.floor(Math.random() * 7);

  const eventDate = new Date(today);
  eventDate.setDate(eventDate.getDate() + daysAhead);

  // Random hour between 8 and 20
  const hour = Math.floor(Math.random() * 12) + 8;
  eventDate.setHours(hour, 0, 0, 0);

  addEvent(createEvent({
    title: `New Event ${daysAhead} days ahead`,
    start: eventDate
  }));
}

// Update the selected event
function updateSelectedEvent() {
  if (selectedEvent.value) {
    updateEvent(selectedEvent.value.id, {
      title: `${selectedEvent.value.title} (Updated)`,
      color: '#8E24AA' // Change to purple
    });
    selectedEvent.value = null;
  }
}

// Delete the selected event
function deleteSelectedEvent() {
  if (selectedEvent.value) {
    deleteEvent(selectedEvent.value.id);
    selectedEvent.value = null;
  }
}

// Format event details for display
function formatEventDetails(event: CalendarEvent): string {
  const startDate = event.start.toLocaleDateString();
  const startTime = event.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = event.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${startDate} from ${startTime} to ${endTime}`;
}

onMounted(() => {
  // When component is mounted, refresh the fetch calendar
  refreshFetchCalendar();
});
</script>

<style scoped>
.example-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', 'Arial', sans-serif;
}

h1 {
  color: #1a73e8;
  margin-bottom: 30px;
}

.example-section {
  margin-bottom: 40px;
  padding: 20px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #3c4043;
  font-size: 20px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #dadce0;
}

.controls {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
  align-items: center;
}

button {
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #1967d2;
}

.loading-indicator {
  color: #1a73e8;
  font-style: italic;
}

.error-message {
  color: #EA4335;
  font-weight: 500;
}

.selected-event {
  margin: 15px 0;
  padding: 15px;
  background-color: #f1f3f4;
  border-radius: 4px;
  border-left: 4px solid #1a73e8;
}

.selected-event h3 {
  margin-top: 0;
  color: #1a73e8;
}
</style>
