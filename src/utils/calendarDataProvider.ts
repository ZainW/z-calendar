import { ref, computed, reactive } from 'vue';

// Types
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

// Raw event data type from API
export interface RawEventData {
  [key: string]: unknown;
}

export interface CalendarFetchOptions {
  start: Date;
  end: Date;
  view: 'month' | 'week';
}

export interface CalendarDataSource {
  fetchEvents: (options: CalendarFetchOptions) => Promise<CalendarEvent[]>;
}

// Event modal data interface
export interface EventModalData {
  isOpen: boolean;
  event: CalendarEvent | null;
  isNew: boolean;
  date?: Date;
}

// Create a data source from a static array of events
export function createStaticDataSource(events: CalendarEvent[]): CalendarDataSource {
  return {
    fetchEvents: async (options: CalendarFetchOptions) => {
      // Filter events within the requested range
      return events.filter(event => {
        return event.start >= options.start && event.start <= options.end;
      });
    }
  };
}

// Create a data source from a fetch function
export function createFetchDataSource(
  fetchFn: (start: Date, end: Date) => Promise<CalendarEvent[]>
): CalendarDataSource {
  return {
    fetchEvents: async (options: CalendarFetchOptions) => {
      return await fetchFn(options.start, options.end);
    }
  };
}

// Create a composable for advanced calendar state management
export function useCalendarStore(options: {
  initialEvents?: CalendarEvent[];
  fetchFn?: (start: Date, end: Date) => Promise<RawEventData[]>;
  transformEvent?: (event: RawEventData) => CalendarEvent;
} = {}) {
  const state = reactive({
    events: options.initialEvents || [],
    isLoading: false,
    error: null as Error | null,
  });

  // Create a data source
  const dataSource: CalendarDataSource = {
    fetchEvents: async (fetchOptions: CalendarFetchOptions) => {
      try {
        state.isLoading = true;
        state.error = null;

        if (options.fetchFn) {
          const events = await options.fetchFn(fetchOptions.start, fetchOptions.end);

          // Transform events if needed
          if (options.transformEvent) {
            state.events = events.map(options.transformEvent);
          } else {
            state.events = events as unknown as CalendarEvent[];
          }

          return state.events;
        } else {
          // If no fetch function, return static events
          return state.events.filter(event =>
            event.start >= fetchOptions.start && event.start <= fetchOptions.end
          );
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        state.error = error;
        throw error;
      } finally {
        state.isLoading = false;
      }
    }
  };

  // Add event
  function addEvent(event: CalendarEvent) {
    state.events.push(event);
    return event;
  }

  // Update event
  function updateEvent(id: string | number, updates: Partial<CalendarEvent>) {
    const index = state.events.findIndex(e => e.id === id);
    if (index !== -1) {
      state.events[index] = { ...state.events[index], ...updates };
      return state.events[index];
    }
    return null;
  }

  // Delete event
  function deleteEvent(id: string | number) {
    const index = state.events.findIndex(e => e.id === id);
    if (index !== -1) {
      const [removed] = state.events.splice(index, 1);
      return removed;
    }
    return null;
  }

  return {
    events: computed(() => state.events),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    dataSource,
    addEvent,
    updateEvent,
    deleteEvent
  };
}

// Helper to generate random color
export function generateEventColor(seed?: string): string {
  const colors = [
    '#4285F4', // Blue
    '#EA4335', // Red
    '#FBBC05', // Yellow
    '#34A853', // Green
    '#FF6D01', // Orange
    '#46BDC6', // Teal
    '#7986CB', // Indigo
    '#8E24AA', // Purple
    '#16A765', // Light green
    '#DB4437'  // Light red
  ];

  if (seed) {
    // Generate a consistent color based on the seed string
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  // Random color
  return colors[Math.floor(Math.random() * colors.length)];
}

// Helper to create a date range
export function createDateRange(start: Date, end: Date): Date[] {
  const dates: Date[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

// Helper to create a new event
export function createEvent(options: {
  id?: string | number;
  title: string;
  start: Date;
  end?: Date;
  color?: string;
}): CalendarEvent {
  const id = options.id || `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const start = new Date(options.start);

  // Default end time is 1 hour after start
  let end: Date;
  if (options.end) {
    end = new Date(options.end);
  } else {
    end = new Date(start);
    end.setHours(end.getHours() + 1);
  }

  return {
    id,
    title: options.title,
    start,
    end,
    color: options.color || generateEventColor(typeof id === 'string' ? id : String(id))
  };
}

// Helper to move an event to a new date
export function moveEventToDate(event: CalendarEvent, newDate: Date): CalendarEvent {
  const startTime = event.start.getTime();
  const endTime = event.end.getTime();
  const duration = endTime - startTime;

  const newStart = new Date(newDate);
  // Keep original time
  newStart.setHours(
    event.start.getHours(),
    event.start.getMinutes(),
    event.start.getSeconds()
  );

  const newEnd = new Date(newStart.getTime() + duration);

  return {
    ...event,
    start: newStart,
    end: newEnd
  };
}

// Helper to get time difference in milliseconds between two events
export function getTimeDifference(fromEvent: CalendarEvent, toEvent: CalendarEvent): number {
  return toEvent.start.getTime() - fromEvent.start.getTime();
}
