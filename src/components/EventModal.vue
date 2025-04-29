<template>
  <div v-if="isOpen" class="event-modal-backdrop" @click="closeModal">
    <div class="event-modal" @click.stop>
      <div class="event-modal-header" :style="{ backgroundColor: event?.color || '#4285F4' }">
        <h2>{{ isNew ? 'New Event' : 'Edit Event' }}</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>
      <div class="event-modal-body">
        <div class="form-group">
          <label for="event-title">Title</label>
          <input
            id="event-title"
            v-model="formData.title"
            type="text"
            placeholder="Event title"
            class="form-control"
          />
        </div>

        <div class="form-row">
          <div class="form-group date-time-group">
            <label for="event-start-date">Start Date</label>
            <input
              id="event-start-date"
              v-model="formData.startDate"
              type="date"
              class="form-control"
            />
          </div>
          <div class="form-group date-time-group">
            <label for="event-start-time">Start Time</label>
            <input
              id="event-start-time"
              v-model="formData.startTime"
              type="time"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group date-time-group">
            <label for="event-end-date">End Date</label>
            <input
              id="event-end-date"
              v-model="formData.endDate"
              type="date"
              class="form-control"
            />
          </div>
          <div class="form-group date-time-group">
            <label for="event-end-time">End Time</label>
            <input
              id="event-end-time"
              v-model="formData.endTime"
              type="time"
              class="form-control"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="event-color">Color</label>
          <input
            id="event-color"
            v-model="formData.color"
            type="color"
            class="form-control color-picker"
          />
        </div>
      </div>

      <div class="event-modal-footer">
        <div class="button-group">
          <button v-if="!isNew" class="delete-button" @click="deleteEvent">Delete</button>
          <div class="action-buttons">
            <button class="cancel-button" @click="closeModal">Cancel</button>
            <button class="save-button" @click="saveEvent">Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { CalendarEvent } from '../utils/calendarDataProvider';

// Props
const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  event: {
    type: Object as () => CalendarEvent | null,
    default: null
  },
  isNew: {
    type: Boolean,
    default: true
  },
  date: {
    type: Date,
    default: () => new Date()
  }
});

// Emits
const emit = defineEmits(['close', 'save', 'delete']);

// Form data
const formData = ref({
  title: '',
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  color: '#4285F4'
});

// Format date for input field
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

// Format time for input field
function formatTime(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

// Parse date and time into Date object
function parseDateTime(dateStr: string, timeStr: string): Date {
  const date = new Date(dateStr);
  const [hours, minutes] = timeStr.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Initialize form data when component mounts or when event prop changes
watch(() => [props.isOpen, props.event, props.date], () => {
  if (props.isOpen) {
    if (props.event) {
      // Edit existing event
      formData.value = {
        title: props.event.title,
        startDate: formatDate(props.event.start),
        startTime: formatTime(props.event.start),
        endDate: formatDate(props.event.end),
        endTime: formatTime(props.event.end),
        color: props.event.color
      };
    } else {
      // New event
      const startDate = props.date || new Date();
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1);

      formData.value = {
        title: '',
        startDate: formatDate(startDate),
        startTime: formatTime(startDate),
        endDate: formatDate(endDate),
        endTime: formatTime(endDate),
        color: '#4285F4'
      };
    }
  }
}, { immediate: true });

// Methods
function closeModal() {
  emit('close');
}

function saveEvent() {
  const start = parseDateTime(formData.value.startDate, formData.value.startTime);
  const end = parseDateTime(formData.value.endDate, formData.value.endTime);

  const updatedEvent: CalendarEvent = {
    id: props.event?.id || `event-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    title: formData.value.title,
    start,
    end,
    color: formData.value.color
  };

  emit('save', updatedEvent);
  closeModal();
}

function deleteEvent() {
  if (props.event) {
    emit('delete', props.event.id);
    closeModal();
  }
}
</script>

<style>
.event-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.event-modal {
  background-color: white;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.event-modal-header {
  padding: 16px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.event-modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  margin: 0;
}

.event-modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.date-time-group {
  flex: 1;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #3c4043;
}

.form-control {
  width: 100%;
  padding: 10px;
  border: 1px solid #dadce0;
  border-radius: 4px;
  font-size: 14px;
}

.color-picker {
  height: 40px;
  padding: 2px;
}

.event-modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #dadce0;
}

.button-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

button {
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.cancel-button {
  background-color: #f1f3f4;
  color: #3c4043;
  border: 1px solid #dadce0;
}

.save-button {
  background-color: #1a73e8;
  color: white;
}

.delete-button {
  background-color: #ea4335;
  color: white;
}

.cancel-button:hover {
  background-color: #e8eaed;
}

.save-button:hover {
  background-color: #1967d2;
}

.delete-button:hover {
  background-color: #d93025;
}
</style>
