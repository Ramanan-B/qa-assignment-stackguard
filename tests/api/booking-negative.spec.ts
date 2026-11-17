import { test, expect } from '../../fixtures/api.fixture';
import { newBooking } from '../../test-data/bookings';

const NON_EXISTENT_ID = 999_999_999;

test.describe('Booking: missing or bad token', () => {
  test('update without a token is refused and the booking is unchanged', async ({ booker, createBooking }) => {
    const { id, data } = await createBooking();

    const res = await booker.update(id, newBooking({ firstname: 'Intruder' }));

    expect(res.status()).toBe(403);
    expect(await (await booker.get(id)).json()).toEqual(data);
  });

  test('update with an invalid token is refused and the booking is unchanged', async ({ booker, createBooking }) => {
    const { id, data } = await createBooking();

    const res = await booker.patch(id, { totalprice: 1 }, 'not-a-real-token');

    expect(res.status()).toBe(403);
    expect(await (await booker.get(id)).json()).toEqual(data);
  });

  test('delete without a token is refused and the booking still exists', async ({ booker, createBooking }) => {
    const { id } = await createBooking();

    const res = await booker.delete(id);

    expect(res.status()).toBe(403);
    expect((await booker.get(id)).status()).toBe(200);
  });
});

test.describe('Booking: wrong ID', () => {
  test('reading a booking that does not exist returns 404', async ({ booker }) => {
    expect((await booker.get(NON_EXISTENT_ID)).status()).toBe(404);
  });

  test('reading with a non-numeric id returns 404', async ({ booker }) => {
    expect((await booker.get('abc')).status()).toBe(404);
  });

  test('deleting a booking that does not exist returns 404', async ({ booker, token }) => {
    test.fail(true, 'Known API bug BUG-API-01: returns 405 Method Not Allowed instead of 404');

    expect((await booker.delete(NON_EXISTENT_ID, token)).status()).toBe(404);
  });
});

test.describe('Booking: invalid input', () => {
  test('creating a booking with required fields missing returns 400', async ({ booker }) => {
    test.fail(true, 'Known API bug BUG-API-02: returns 500 Internal Server Error instead of 400');

    const res = await booker.create({ firstname: 'QA' });

    expect(res.status()).toBe(400);
  });

  test('creating a booking with checkout before checkin is rejected', async ({ booker, trackForCleanup }) => {
    test.fail(true, 'Known API bug BUG-API-03: the booking is accepted with 200');

    const res = await booker.create(
      newBooking({ bookingdates: { checkin: '2027-03-10', checkout: '2027-03-01' } }),
    );
    // If the API wrongly accepts it, make sure the booking is still cleaned up.
    if (res.ok()) trackForCleanup((await res.json()).bookingid);

    expect(res.status()).toBe(400);
  });
});
