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

interface CalendarComponent {
  currentMonth: number
  currentYear: number
  view: 'month' | 'week'
  events: CalendarEvent[]
}

interface EventCardComponent {
  showRescheduleModal: boolean
}

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

    // Switch to week view
    await wrapper.find('button:contains("Week")').trigger('click')
    expect(wrapper.find('.week-view').exists()).toBe(true)
    expect(wrapper.find('.month-view').exists()).toBe(false)

    // Switch back to month view
    await wrapper.find('button:contains("Month")').trigger('click')
    expect(wrapper.find('.month-view').exists()).toBe(true)
    expect(wrapper.find('.week-view').exists()).toBe(false)
  })

  it('navigates between months', async () => {
    const initialMonth = new Date().getMonth()
    const initialYear = new Date().getFullYear()

    // Go to previous month
    await wrapper.find('button:contains("<")').trigger('click')
    const prevMonth = initialMonth === 0 ? 11 : initialMonth - 1
    const prevYear = initialMonth === 0 ? initialYear - 1 : initialYear
    expect(wrapper.find('.calendar-title h2').text()).toContain(
      new Date(prevYear, prevMonth).toLocaleString('default', { month: 'long' })
    )

    // Go to next month
    await wrapper.find('button:contains(">")').trigger('click')
    expect(wrapper.find('.calendar-title h2').text()).toContain(
      new Date(initialYear, initialMonth).toLocaleString('default', { month: 'long' })
    )
  })

  it('displays events correctly', () => {
    const dayWithEvent = wrapper.find('.day-cell.has-events')
    expect(dayWithEvent.exists()).toBe(true)
    expect(dayWithEvent.find('.event').text()).toContain('Test Event')
  })

  it('handles day selection', async () => {
    const dayCell = wrapper.find('.day-cell')
    await dayCell.trigger('click')
    expect(wrapper.emitted('day-selected')).toBeTruthy()
  })

  it('goes to today when clicking today button', async () => {
    const today = new Date()
    await wrapper.find('button:contains("Today")').trigger('click')
    expect(wrapper.find('.calendar-title h2').text()).toContain(
      today.toLocaleString('default', { month: 'long' })
    )
    expect(wrapper.find('.calendar-title h2').text()).toContain(today.getFullYear())
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
        referenceEl: div,
        onClose: () => {},
        onReschedule: () => {},
        onCancel: () => {}
      }
    })
  })

  it('renders event details correctly', () => {
    expect(wrapper.find('.event-title').text()).toBe('Test Event')
    expect(wrapper.find('.time').text()).toContain('10:00 AM')
    expect(wrapper.find('.email').text()).toBe('test@example.com')
    expect(wrapper.find('.organizer').text()).toBe('Test Organizer')
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
