# Vue Calendar Component

A feature-rich calendar component for Vue.js applications with built-in data management, event handling, and multiple view options.

## Features

- 📅 Multiple views: Month and Week views
- 🔄 Built-in data fetching and caching
- 💾 Event management with CRUD operations
- 🎨 Customizable styling
- 🔌 Flexible data sources
- ⚡ Optimized rendering
- 📱 Responsive design

## Installation

```bash
npm install vue-calendar-component
# or
yarn add vue-calendar-component
```

## Basic Usage

```vue
<template>
  <MyCalendar :events="events" />
</template>

<script setup>
import { ref } from 'vue';
import { MyCalendar } from 'vue-calendar-component';

const events = ref([
  {
    id: 1,
    title: 'Meeting with Team',
    start: new Date(2023, 5, 15, 10, 0),
    end: new Date(2023, 5, 15, 11, 30),
    color: '#4285F4'
  },
  {
    id: 2,
    title: 'Lunch with Client',
    start: new Date(2023, 5, 15, 13, 0),
    end: new Date(2023, 5, 15, 14, 0),
    color: '#EA4335'
  }
]);
</script>
```

## Using the Data Layer

The calendar component provides a powerful data layer for fetching, caching, and managing events:

### With a Custom Data Source

```vue
<template>
  <MyCalendar :data-source="dataSource" />
</template>

<script setup>
import { MyCalendar } from 'vue-calendar-component';
import { createFetchDataSource } from 'vue-calendar-component/utils';

// Create a data source that fetches events from your API
const dataSource = createFetchDataSource(async (start, end) => {
  const response = await fetch(`/api/events?start=${start.toISOString()}&end=${end.toISOString()}`);
  const data = await response.json();
  return data.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    color: event.color || '#4285F4'
  }));
});
</script>
```

### Using the Calendar Store

For more advanced state management, you can use the calendar store:

```vue
<template>
  <div>
    <button @click="addNewEvent">Add Event</button>
    <MyCalendar :data-source="calendarStore.dataSource" />
  </div>
</template>

<script setup>
import { MyCalendar } from 'vue-calendar-component';
import { useCalendarStore, createEvent } from 'vue-calendar-component/utils';

// Create a calendar store
const calendarStore = useCalendarStore({
  // Optional: Initial events
  initialEvents: [],
  
  // Optional: Function to fetch events from an API
  fetchFn: async (start, end) => {
    const response = await fetch(`/api/events?start=${start.toISOString()}&end=${end.toISOString()}`);
    return await response.json();
  },
  
  // Optional: Transform API response to calendar event format
  transformEvent: (apiEvent) => ({
    id: apiEvent.id,
    title: apiEvent.title,
    start: new Date(apiEvent.start_time),
    end: new Date(apiEvent.end_time),
    color: apiEvent.category_color || '#4285F4'
  })
});

// Add a new event
function addNewEvent() {
  calendarStore.addEvent(createEvent({
    title: 'New Event',
    start: new Date(),
  }));
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `events` | `Array` | `[]` | Array of event objects |
| `dataSource` | `Object` | `null` | Custom data source for fetching events |
| `cacheExpiry` | `Number` | `300000` | Cache expiry time in milliseconds (5 minutes) |
| `autoFetch` | `Boolean` | `true` | Whether to fetch events automatically |

## Events

| Event | Parameters | Description |
|-------|------------|-------------|
| `update:events` | `(events)` | Emitted when events are updated |
| `fetch-start` | `({ start, end, view })` | Emitted when event fetching starts |
| `fetch-success` | `(events)` | Emitted when events are successfully fetched |
| `fetch-error` | `(error)` | Emitted when an error occurs during fetching |

## Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `refreshEvents` | - | Refresh events from the data source |
| `switchView` | `(view)` | Switch between month and week views |
| `goToToday` | - | Navigate to today's date |
| `previousPeriod` | - | Navigate to the previous month/week |
| `nextPeriod` | - | Navigate to the next month/week |

## Utility Functions

The package provides several utility functions to help with event management:

- `createEvent({ title, start, end, color })`: Create a new event object
- `createStaticDataSource(events)`: Create a data source from static events
- `createFetchDataSource(fetchFn)`: Create a data source from a fetch function
- `useCalendarStore(options)`: Create a reactive calendar store
- `generateEventColor(seed)`: Generate a consistent color for events

## Customization

The calendar component can be styled using CSS variables or by overriding the default styles:

```css
.calendar-container {
  /* Custom styles */
  --calendar-header-bg: #f8f9fa;
  --calendar-border-color: #e1e1e1;
  --calendar-event-border-radius: 4px;
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
