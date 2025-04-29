import { DefineComponent } from 'vue';

interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

declare const MyCalendar: DefineComponent<{
  events: {
    type: () => CalendarEvent[];
    required: true;
    default: () => CalendarEvent[];
  }
}>;

export default MyCalendar;
