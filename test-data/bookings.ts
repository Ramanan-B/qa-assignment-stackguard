import { randomUUID } from 'crypto';

export interface BookingDates {
  checkin: string;
  checkout: string;
}

export interface Booking {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: BookingDates;
  additionalneeds?: string;
}

/** Admin credentials published in the Restful-Booker docs. */
export const ADMIN = { username: 'admin', password: 'password123' };

/**
 * A new booking with a unique last name, so our data never collides with other
 * people using the shared public API at the same time.
 */
export function newBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    firstname: 'QA',
    lastname: `Tester-${randomUUID().slice(0, 8)}`,
    totalprice: 150,
    depositpaid: true,
    bookingdates: { checkin: '2027-01-10', checkout: '2027-01-14' },
    additionalneeds: 'Breakfast',
    ...overrides,
  };
}
