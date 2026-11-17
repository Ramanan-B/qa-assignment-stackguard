import { test, expect } from '../../fixtures/api.fixture';
import { newBooking } from '../../test-data/bookings';

test.describe('Booking CRUD', () => {
  test('create returns an id and echoes the booking', async ({ booker, trackForCleanup }) => {
    const data = newBooking();

    const res = await booker.create(data);

    expect(res.status()).toBe(200);
    const body = await res.json();
    trackForCleanup(body.bookingid);
    expect(body.bookingid).toEqual(expect.any(Number));
    expect(body.booking).toEqual(data);
  });

  test('read returns the booking that was created', async ({ booker, createBooking }) => {
    const { id, data } = await createBooking();

    const res = await booker.get(id);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(data);
  });

  test('search by name finds the created booking', async ({ booker, createBooking }) => {
    const { id, data } = await createBooking();

    const res = await booker.findIds({ firstname: data.firstname, lastname: data.lastname });

    expect(res.status()).toBe(200);
    const ids = (await res.json()).map((b: { bookingid: number }) => b.bookingid);
    expect(ids).toContain(id);
  });

  test('update (PUT) with a token replaces the booking', async ({ booker, token, createBooking }) => {
    const { id } = await createBooking();
    const changed = newBooking({
      firstname: 'Updated',
      totalprice: 275,
      depositpaid: false,
      bookingdates: { checkin: '2027-02-01', checkout: '2027-02-05' },
      additionalneeds: 'Late checkout',
    });

    const res = await booker.update(id, changed, token);

    expect(res.status()).toBe(200);
    expect(await res.json()).toEqual(changed);
    expect(await (await booker.get(id)).json()).toEqual(changed);
  });

  test('partial update (PATCH) changes only the given fields', async ({ booker, token, createBooking }) => {
    const { id, data } = await createBooking();

    const res = await booker.patch(id, { totalprice: 999, additionalneeds: 'Dinner' }, token);

    expect(res.status()).toBe(200);
    expect(await (await booker.get(id)).json()).toEqual({
      ...data,
      totalprice: 999,
      additionalneeds: 'Dinner',
    });
  });

  test('delete with a token removes the booking', async ({ booker, token, createBooking }) => {
    const { id } = await createBooking();

    const res = await booker.delete(id, token);

    // The API returns 201 Created for a successful delete (its documented behaviour).
    expect(res.status()).toBe(201);
    expect((await booker.get(id)).status()).toBe(404);
  });
});
