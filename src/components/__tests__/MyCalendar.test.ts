import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import MyCalendar from '../MyCalendar.vue'
import EventCard from '../EventCard.vue'
import RescheduleModal from '../RescheduleModal.vue'

interface CalendarEvent {
  id: string | number
  title: string
  start: Date
  end: Date
  color: string
  organizer?: string
  email?: string
}

// interface CalendarComponent {
//   currentMonth: number
//   currentYear: number
//   view: 'month' | 'week'
//   events: CalendarEvent[]
// }

// interface EventCardComponent {
//   showRescheduleModal: boolean
// }

describe('MyCalendar', () => {
  let wrapper: VueWrapper<InstanceType<typeof MyCalendar>>

  const mockEvents: CalendarEvent[] = [
    {
      id: '1',
      title: 'Test Event',
      start: new Date(2024, 4, 1, 10, 0),
      end: new Date(2024, 4, 1, 11, 0),
      color: '#FF0000',
      organizer: 'Test Organizer',
      email: 'test@example.com'
    }
  ]

  beforeEach(() => {
    wrapper = mount(MyCalendar, {
      props: {
        events: mockEvents
      }
    })
  })

  it('renders correctly', () => {
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.calendar-container').exists()).toBe(true)
  })

  it('displays current month and year', () => {
    const currentDate = new Date()
    const monthName = currentDate.toLocaleString('default', { month: 'long' })
    const year = currentDate.getFullYear()

    expect(wrapper.find('.calendar-title h2').text()).toContain(monthName)
    expect(wrapper.find('.calendar-title h2').text()).toContain(year)
  })

  it('switches between month and week views', async () => {
    // Default view should be month
    expect(wrapper.find('.month-view').exists()).toBe(true)
    expect(wrapper.find('.week-view').exists()).toBe(false)

    // Find the Week button by text
    const weekBtn = wrapper.findAll('button').find(btn => btn.text() === 'Week')
    expect(weekBtn).toBeTruthy()
    await weekBtn!.trigger('click')
    expect(wrapper.find('.week-view').exists()).toBe(true)
    expect(wrapper.find('.month-view').exists()).toBe(false)

    // Find the Month button by text
    const monthBtn = wrapper.findAll('button').find(btn => btn.text() === 'Month')
    expect(monthBtn).toBeTruthy()
    await monthBtn!.trigger('click')
    expect(wrapper.find('.month-view').exists()).toBe(true)
    expect(wrapper.find('.week-view').exists()).toBe(false)
  })

  it('navigates between months', async () => {
    const initialMonth = new Date().getMonth()
    const initialYear = new Date().getFullYear()

    // Find the prev/next buttons by their text
    const prevBtn = wrapper.findAll('button').find(btn => btn.text() === '<')
    const nextBtn = wrapper.findAll('button').find(btn => btn.text() === '>')
    expect(prevBtn).toBeTruthy()
    expect(nextBtn).toBeTruthy()

    // Go to previous month
    await prevBtn!.trigger('click')
    const prevMonth = initialMonth === 0 ? 11 : initialMonth - 1
    const prevYear = initialMonth === 0 ? initialYear - 1 : initialYear
    expect(wrapper.find('.calendar-title h2').text()).toContain(
      new Date(prevYear, prevMonth).toLocaleString('default', { month: 'long' })
    )

    // Go to next month
    await nextBtn!.trigger('click')
    expect(wrapper.find('.calendar-title h2').text()).toContain(
      new Date(initialYear, initialMonth).toLocaleString('default', { month: 'long' })
    )
  })

  it('displays events correctly', async () => {
    // Ensure the calendar is set to the month/year of the mock event
    const eventDate = mockEvents[0].start
    const calendarDate = wrapper.vm.$.exposed?.currentDate?.value || new Date()
    if (
      calendarDate.getFullYear() !== eventDate.getFullYear() ||
      calendarDate.getMonth() !== eventDate.getMonth()
    ) {
      // Set calendar to the event's month/year
      if (wrapper.vm.$.exposed && wrapper.vm.$.exposed.currentDate) {
        wrapper.vm.$.exposed.currentDate.value = new Date(eventDate)
      }
      await wrapper.vm.$nextTick()
    }
    // Find a day cell with events
    const dayWithEvent = wrapper.findAll('.day-cell').find(cell => cell.classes().includes('has-events'))
    expect(dayWithEvent).toBeTruthy()
    expect(dayWithEvent!.find('.event').text()).toContain('Test Event')
  })

  it('handles day selection', async () => {
    const dayCell = wrapper.find('.day-cell')
    await dayCell.trigger('click')
    // The component does not emit 'day-selected', so just check that the event card opens
    // (selectedEvent and isEventCardOpen become true)
    // We can check for the EventCard being present and open
    await wrapper.vm.$nextTick()
    expect(wrapper.findComponent(EventCard).props('isOpen')).toBe(true)
  })

  it('goes to today when clicking today button', async () => {
    const todayBtn = wrapper.findAll('button').find(btn => btn.text() === 'Today')
    expect(todayBtn).toBeTruthy()
    await todayBtn!.trigger('click')
    const today = new Date()
    expect(wrapper.find('.calendar-title h2').text()).toContain(
      today.toLocaleString('default', { month: 'long' })
    )
    expect(wrapper.find('.calendar-title h2').text()).toContain(today.getFullYear().toString())
  })
})

describe('EventCard', () => {
  let wrapper: VueWrapper<InstanceType<typeof EventCard>>

  const mockEvent: CalendarEvent = {
    id: '1',
    title: 'Test Event',
    start: new Date(2024, 4, 1, 10, 0),
    end: new Date(2024, 4, 1, 11, 0),
    color: '#FF0000',
    organizer: 'Test Organizer',
    email: 'test@example.com'
  }

  beforeEach(() => {
    const div = document.createElement('div')
    document.body.appendChild(div)

    wrapper = mount(EventCard, {
      props: {
        event: mockEvent,
        isOpen: true,
        referenceEl: div
      }
    })
  })

  it('renders event details correctly', () => {
    expect(wrapper.find('.event-title').text()).toBe('Test Event')
    expect(wrapper.find('.time').text()).toMatch(/10(:00)?\s?AM/i)
    expect(wrapper.find('.email').text()).toBe('test@example.com')
    // Organizer is in a detail-section, not a class, so find by heading then next sibling
    const organizerSection = wrapper.findAll('.detail-section').find(sec => sec.find('h3').text() === 'By')
    expect(organizerSection).toBeTruthy()
    expect(organizerSection!.find('p').text()).toBe('Test Organizer')
  })

  it('emits close event when close button is clicked', async () => {
    await wrapper.find('.close-button').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows reschedule modal when time button is clicked', async () => {
    await wrapper.find('.time-button').trigger('click')
    expect(wrapper.findComponent(RescheduleModal).exists()).toBe(true)
  })
})

describe('MyCalendar – additional scenarios', () => {
  it('renders placeholder when no events are passed', () => {
    const emptyWrapper = mount(MyCalendar, { props: { events: [] } });
    // Assuming component shows a .no-events element when there are zero events
    expect(emptyWrapper.find('.day-cell.has-events').exists()).toBe(false);
    expect(emptyWrapper.find('.no-events').text()).toBe('No events');
  });

  it('renders multi-day events spanning month boundaries correctly', () => {
    const spanEvent = {
      id: '2',
      title: 'Span Event',
      start: new Date(2024, 0, 30, 9, 0),
      end: new Date(2024, 1, 2, 17, 0),
      color: '#00FF00'
    };
    const wrapper2 = mount(MyCalendar, { props: { events: [spanEvent] } });
    const spannedDays = wrapper2.findAll('.day-cell.has-events');
    expect(spannedDays.length).toBeGreaterThanOrEqual(4);
  });

  it('handles overlapping events within the same day', () => {
    const e1 = { id: '3', title: 'First', start: new Date(2024, 4, 1, 9), end: new Date(2024, 4, 1, 12), color: '#0000FF' };
    const e2 = { id: '4', title: 'Second', start: new Date(2024, 4, 1, 11), end: new Date(2024, 4, 1, 14), color: '#FF00FF' };
    const overlapWrapper = mount(MyCalendar, { props: { events: [e1, e2] } });
    const overlappingDay = overlapWrapper.find('.day-cell.has-events');
    expect(overlappingDay.findAll('.event').length).toBe(2);
  });

  it('wraps year transition correctly when navigating December → January', async () => {
    // Force currentMonth/currentYear via component instance override
    const decWrapper = mount(MyCalendar, {
      props: { events: [] },
      data: () => ({ currentMonth: 11, currentYear: 2023 })
    });
    // Back to November 2023
    await decWrapper.find('button:contains("<")').trigger('click');
    expect(decWrapper.find('.calendar-title h2').text()).toMatch(/November\s2023/);
    // Forward twice into January 2024
    await decWrapper.find('button:contains(">")').trigger('click');
    await decWrapper.find('button:contains(">")').trigger('click');
    expect(decWrapper.find('.calendar-title h2').text()).toMatch(/January\s2024/);
  });
});

describe('EventCard – extended behaviors', () => {
  const baseEvent = {
    id: '1',
    title: 'Test Event',
    start: new Date(2024, 4, 1, 10),
    end: new Date(2024, 4, 1, 11),
    color: '#FF0000'
  };

  it('invokes onReschedule callback when reschedule confirmed', async () => {
    const onReschedule = vi.fn();
    const wrapper = mount(EventCard, {
      props: {
        event: baseEvent,
        isOpen: true,
        referenceEl: document.createElement('div'),
        onClose: () => {},
        onReschedule,
        onCancel: () => {}
      }
    });
    await wrapper.find('.time-button').trigger('click');
    await wrapper.find('.reschedule-confirm-button').trigger('click');
    expect(onReschedule).toHaveBeenCalledOnce();
  });

  it('invokes onCancel callback when reschedule cancelled', async () => {
    const onCancel = vi.fn();
    const wrapper = mount(EventCard, {
      props: {
        event: baseEvent,
        isOpen: true,
        referenceEl: document.createElement('div'),
        onClose: () => {},
        onReschedule: () => {},
        onCancel
      }
    });
    await wrapper.find('.time-button').trigger('click');
    await wrapper.find('.reschedule-cancel-button').trigger('click');
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('renders gracefully when optional props (email/organizer) are missing', () => {
    const minimalEvent = {
      id: '5',
      title: 'Minimal',
      start: new Date(),
      end: new Date(),
      color: '#123456'
    };
    const wrapper = mount(EventCard, {
      props: {
        event: minimalEvent,
        isOpen: false,
        referenceEl: document.createElement('div'),
        onClose: () => {},
        onReschedule: () => {},
        onCancel: () => {}
      }
    });
    expect(wrapper.find('.email').exists()).toBe(false);
    expect(wrapper.find('.organizer').exists()).toBe(false);
  });
});