import MyCalendar from './components/MyCalendar.vue'

// Define and export the CalendarEvent interface
export interface CalendarEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  color: string;
}

export { MyCalendar }
export default MyCalendar
