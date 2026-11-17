import { test as base, expect } from '@playwright/test';
import { BookingClient } from '../api/BookingClient';
import { Booking, newBooking } from '../test-data/bookings';

type CreatedBooking = { id: number; data: Booking };

type ApiFixtures = {
  booker: BookingClient;
  token: string;
  /** Register a booking id so it is deleted after the test, pass or fail. */
  trackForCleanup: (id: number) => void;
  /** Creates a booking with unique data and registers it for cleanup. */
  createBooking: (overrides?: Partial<Booking>) => Promise<CreatedBooking>;
};

export const test = base.extend<ApiFixtures>({
  booker: async ({ request }, use) => {
    await use(new BookingClient(request));
  },

  token: async ({ booker }, use) => {
    await use(await booker.token());
  },

  trackForCleanup: async ({ booker }, use) => {
    const ids = new Set<number>();
    await use((id) => ids.add(id));

    // Teardown runs even when the test fails. The API is shared, so leave nothing behind.
    if (ids.size === 0) return;
    const token = await booker.token();
    for (const id of ids) {
      await booker.delete(id, token);
    }
  },

  createBooking: async ({ booker, trackForCleanup }, use) => {
    await use(async (overrides = {}) => {
      const data = newBooking(overrides);
      const res = await booker.create(data);
      expect(res.status(), 'create booking').toBe(200);
      const { bookingid } = await res.json();
      trackForCleanup(bookingid);
      return { id: bookingid, data };
    });
  },
});

export { expect };
