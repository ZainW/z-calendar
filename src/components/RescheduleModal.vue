<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Reschedule Email</h2>
        <button class="close-button" @click="$emit('close')">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      <div class="date-input">
        <input
          type="datetime-local"
          :value="formatDateForInput(selectedDate)"
          @input="handleDateInput"
          class="datetime-input"
        />
        <button class="calendar-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5v-5z"/>
          </svg>
        </button>
      </div>

      <div class="timezone-section">
        <h3>Timezone Send</h3>
        <p>
          {{ selectedDate ? `Scheduled for ${formatDateTime(selectedDate)}` : 'Choose a date and time' }}<br>
          Sending based on recipients' timezone. Your timezone is GMT-04:00
          Atlantic Time (Canada).
        </p>
        <a href="#" class="learn-more">Learn more</a>
      </div>

      <div class="modal-actions">
        <button class="cancel-button" @click="$emit('close')">Cancel</button>
        <button
          class="save-button"
          :disabled="!selectedDate"
          @click="handleSave"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  currentDate?: Date;
}>();

const emit = defineEmits(['close', 'save']);

const selectedDate = ref<Date | null>(props.currentDate || null);

// Update selectedDate when currentDate prop changes
watch(() => props.currentDate, (newDate) => {
  if (newDate) {
    selectedDate.value = newDate;
  }
});

function formatDateTime(date?: Date): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  }).format(date);
}

function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  return date.toISOString().slice(0, 16); // Format for datetime-local input
}

function handleDateInput(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.value) {
    selectedDate.value = new Date(input.value);
  } else {
    selectedDate.value = null;
  }
}

function handleSave() {
  if (selectedDate.value) {
    emit('save', selectedDate.value);
  }
}
</script>

<style>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 480px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.modal-header h2 {
  font-size: 24px;
  font-weight: 400;
  color: #202124;
  margin: 0;
  line-height: 1.2;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  color: #5f6368;
  cursor: pointer;
  margin: -8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: #f1f3f4;
}

.date-input {
  position: relative;
  margin-bottom: 32px;
}

.datetime-input {
  width: 100%;
  padding: 16px;
  font-size: 18px;
  font-family: 'Roboto Mono', monospace;
  border: 1px solid #dadce0;
  border-radius: 8px;
  color: #202124;
  background: #f8f9fa;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.datetime-input:hover {
  border-color: #bdc1c6;
}

.datetime-input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.datetime-input::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.calendar-button {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 8px;
  color: #5f6368;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.timezone-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
}

.timezone-section h3 {
  font-size: 16px;
  font-weight: 500;
  color: #202124;
  margin: 0 0 12px 0;
}

.timezone-section p {
  font-size: 14px;
  color: #5f6368;
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.learn-more {
  color: #1a73e8;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  display: inline-block;
  cursor: pointer;
  transition: color 0.2s;
}

.learn-more:hover {
  color: #1557b0;
  text-decoration: underline;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 40px;
}

.cancel-button {
  background: none;
  border: none;
  padding: 0 16px;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  color: #5f6368;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.cancel-button:hover {
  background: #f1f3f4;
}

.save-button {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 0 24px;
  height: 36px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #1557b0;
}

.save-button:disabled {
  background: #dadce0;
  cursor: not-allowed;
}
</style>
