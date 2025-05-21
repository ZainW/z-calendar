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

    expect(wrapper.find('.calendar-header-title').text()).toContain(monthName)
    expect(wrapper.find('.calendar-header-title').text()).toContain(year.toString())
  })

  it('switches between month and week views', async () => {
    // Default view should be month
    expect(wrapper.find('.month-view').exists()).toBe(true)
    expect(wrapper.find('.week-view').exists()).toBe(false)

    // Open the view dropdown
    const dropdownBtn = wrapper.find('.custom-dropdown-btn')
    await dropdownBtn.trigger('click')
    // Find the week option and click it
    const weekOption = wrapper.findAll('.custom-dropdown-menu li').find(li => li.text() === 'Week')
    expect(weekOption).toBeTruthy()
    await weekOption!.trigger('click')
    expect(wrapper.find('.week-view').exists()).toBe(true)
    expect(wrapper.find('.month-view').exists()).toBe(false)

    // Open the view dropdown again
    await dropdownBtn.trigger('click')
    // Find the month option and click it
    const monthOption = wrapper.findAll('.custom-dropdown-menu li').find(li => li.text() === 'Month')
    expect(monthOption).toBeTruthy()
    await monthOption!.trigger('click')
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
    const prevBtn2 = wrapper.findAll('button').find(btn => btn.text() === '<')
    await prevBtn2?.trigger('click')
    const prevMonth = initialMonth === 0 ? 11 : initialMonth - 1
    const prevYear = initialMonth === 0 ? initialYear - 1 : initialYear
    expect(wrapper.find('.calendar-header-title').text()).toContain(
      new Date(prevYear, prevMonth).toLocaleString('default', { month: 'long' })
    )

    // Go to next month
    const nextBtn2 = wrapper.findAll('button').find(btn => btn.text() === '>')
    await nextBtn2?.trigger('click')
    expect(wrapper.find('.calendar-header-title').text()).toContain(
      new Date(initialYear, initialMonth).toLocaleString('default', { month: 'long' })
    )
  })

  it('displays events correctly', async () => {
    // Set calendar to May 2024 to match mockEvents
    wrapper.vm.currentDate = new Date(2024, 4, 1)
    await wrapper.vm.$nextTick()
    const dayWithEvent = wrapper.find('.day-cell.has-events')
    expect(dayWithEvent.exists()).toBe(true)
    expect(dayWithEvent.find('.event').text()).toContain('Test Event')
  })

  it('handles day selection', async () => {
    const dayCell = wrapper.find('.day-cell')
    await dayCell.trigger('click')
    await wrapper.vm.$nextTick()
    // The EventCard should NOT open when clicking a day cell (only when clicking an event)
    expect(wrapper.findComponent(EventCard).props('isOpen')).toBe(false)
    // Optionally, check for day-selected event emission if you want:
    // expect(wrapper.emitted('day-selected')).toBeTruthy()
  })

  it('goes to today when clicking today button', async () => {
    const todayBtn = wrapper.findAll('button').find(btn => btn.text() === 'Today')
    expect(todayBtn).toBeTruthy()
    await todayBtn!.trigger('click')
    const today = new Date()
    // Check the header title for today
    expect(wrapper.find('.calendar-header-title').text()).toContain(
      today.toLocaleString('default', { month: 'long' })
    )
    expect(wrapper.find('.calendar-header-title').text()).toContain(today.getFullYear().toString())
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
    expect(wrapper.find('.event-title').exists()).toBe(true)
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

  it('renders multi-day events spanning month boundaries correctly', async () => {
    const spanEvent = {
      id: '2',
      title: 'Span Event',
      start: new Date(2024, 0, 30, 9, 0),
      end: new Date(2024, 1, 2, 17, 0),
      color: '#00FF00'
    };
    const wrapper2 = mount(MyCalendar, { props: { events: [spanEvent] } });
    // Set calendar to January 2024
    wrapper2.vm.currentDate = new Date(2024, 0, 31)
    await wrapper2.vm.$nextTick()
    const spannedDays = wrapper2.findAll('.day-cell.has-events');
    expect(spannedDays.length).toBeGreaterThanOrEqual(4);
  });

  it('handles overlapping events within the same day', async () => {
    const e1 = { id: '3', title: 'First', start: new Date(2024, 4, 1, 9), end: new Date(2024, 4, 1, 12), color: '#0000FF' };
    const e2 = { id: '4', title: 'Second', start: new Date(2024, 4, 1, 11), end: new Date(2024, 4, 1, 14), color: '#FF00FF' };
    const overlapWrapper = mount(MyCalendar, { props: { events: [e1, e2] } });
    // Set calendar to May 2024
    overlapWrapper.vm.currentDate = new Date(2024, 4, 1)
    await overlapWrapper.vm.$nextTick()
    const overlappingDay = overlapWrapper.find('.day-cell.has-events');
    expect(overlappingDay.findAll('.event').length).toBe(2);
  });

  it('wraps year transition correctly when navigating December → January', async () => {
    // Force currentMonth/currentYear via component instance override
    const decWrapper = mount(MyCalendar, {
      props: { events: [] },
      data: () => ({ currentMonth: 11, currentYear: 2023, currentDate: new Date(2023, 11, 1) })
    });
    // Set calendar to December 2023
    decWrapper.vm.currentDate = new Date(2023, 11, 1)
    await decWrapper.vm.$nextTick()
    // Back to November 2023
    const prevBtn = decWrapper.findAll('button').find(btn => btn.text() === '<')
    await prevBtn?.trigger('click');
    expect(decWrapper.find('.calendar-header-title').text()).toMatch(/November\s2023/);
    // Forward twice into January 2024
    const nextBtn = decWrapper.findAll('button').find(btn => btn.text() === '>')
    await nextBtn?.trigger('click');
    await nextBtn?.trigger('click');
    expect(decWrapper.find('.calendar-header-title').text()).toMatch(/January\s2024/);
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
    // Wait for modal to appear
    await wrapper.vm.$nextTick();
    const saveBtn = wrapper.findComponent({ name: 'RescheduleModal' }).find('.save-button')
    await saveBtn.trigger('click');
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
    // Wait for modal to appear
    await wrapper.vm.$nextTick();
    const cancelBtn = wrapper.findComponent({ name: 'RescheduleModal' }).find('.cancel-button')
    await cancelBtn.trigger('click');
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
