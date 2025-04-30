<template>
  <div
    v-if="isOpen"
    ref="floatingEl"
    class="event-card"
    :style="{
      position: 'absolute',
      top: `${y}px`,
      left: `${x}px`,
      zIndex: 1000,
    }"
  >
    <div class="event-card-header">
      <div class="status">
        <div class="status-dot"></div>
        <span>Scheduled</span>
      </div>
      <button class="close-button" @click="$emit('close')">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M14 1.41L12.59 0L7 5.59L1.41 0L0 1.41L5.59 7L0 12.59L1.41 14L7 8.41L12.59 14L14 12.59L8.41 7L14 1.41Z" fill="currentColor"/>
        </svg>
      </button>
    </div>

    <h2 class="event-title">{{ event?.title }}</h2>

    <div class="event-details">
      <div class="detail-section">
        <h3>Scheduled For</h3>
        <p class="time">
          {{ formatDateTime(event?.start) }}
          <button class="time-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
          </button>
        </p>
      </div>

      <div class="detail-section">
        <h3>By</h3>
        <p>{{ event?.organizer }}</p>
      </div>

      <div class="detail-section">
        <h3>From</h3>
        <p class="email">{{ event?.email }}</p>
      </div>

      <div class="detail-section">
        <h3>To</h3>
        <p>{{ event?.to || 'Everyone' }}</p>
      </div>

      <div class="tags" v-if="event?.tags && event.tags.length">
        <span
          v-for="tag in event.tags"
          :key="tag"
          class="tag"
          :class="{ 'tag-leadership': tag === 'Leadership Comms' }"
        >
          {{ tag }}
        </span>
      </div>
    </div>

    <div class="event-actions">
      <button class="action-button primary">
        Reschedule
      </button>
      <button class="action-button secondary">
        Cancel Send
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useFloating, type ReferenceElement } from '@floating-ui/vue';
import { offset, flip, shift } from '@floating-ui/vue';
import type { CalendarEvent } from '../utils/calendarDataProvider';

const props = defineProps<{
  event: CalendarEvent | null;
  isOpen: boolean;
  referenceEl: HTMLElement | null;
}>();

const emit = defineEmits(['close', 'reschedule', 'cancel']);

const floatingEl = ref<HTMLElement | null>(null);
const reference = ref<ReferenceElement | null>(null);

// Update reference when props.referenceEl changes
watch(() => props.referenceEl, (newRef) => {
  reference.value = newRef as ReferenceElement;
}, { immediate: true });

const { x, y, update } = useFloating(
  reference,
  floatingEl,
  {
    placement: 'bottom-start',
    middleware: [
      offset(8),
      flip(),
      shift(),
    ],
  },
);

// Update position when the card becomes visible
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Use nextTick to ensure the DOM is updated
    nextTick(() => {
      update();
    });
  }
});

function formatDateTime(date?: Date): string {
  if (!date) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
}

// Close the card when clicking outside
function handleClickOutside(event: MouseEvent) {
  if (
    floatingEl.value &&
    !floatingEl.value.contains(event.target as Node) &&
    props.referenceEl &&
    !props.referenceEl.contains(event.target as Node)
  ) {
    emit('close');
  }
}

// Update position on window resize
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
  window.addEventListener('resize', update);
  window.addEventListener('scroll', update, true);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
  window.removeEventListener('resize', update);
  window.removeEventListener('scroll', update, true);
});
</script>

<style>
.event-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05), 0 8px 20px rgba(0, 0, 0, 0.08);
  width: 360px;
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.event-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #1a73e8;
}

.status span {
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  padding: 8px;
  color: #5f6368;
  cursor: pointer;
  margin: -8px;
  line-height: 0;
}

.event-title {
  font-size: 28px;
  font-weight: 400;
  color: #202124;
  margin: 0 0 24px 0;
  line-height: 1.2;
}

.detail-section {
  margin-bottom: 16px;
}

.detail-section h3 {
  font-size: 13px;
  color: #5f6368;
  margin: 0 0 4px 0;
  font-weight: 500;
}

.detail-section p {
  font-size: 14px;
  color: #202124;
  margin: 0;
  line-height: 1.4;
}

.time {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1a73e8;
}

.time-button {
  background: none;
  border: none;
  padding: 2px;
  color: #1a73e8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -2px;
}

.email {
  color: #1a73e8;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.tag {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.tag-leadership {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.event-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-button {
  width: 100%;
  padding: 13px 0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  text-align: center;
}

.action-button.primary {
  background-color: #1a73e8;
  color: white;
}

.action-button.primary:hover {
  background-color: #1557b0;
}

.action-button.secondary {
  background-color: #f8f9fa;
  color: #1a73e8;
}

.action-button.secondary:hover {
  background-color: #f1f3f4;
}
</style>
