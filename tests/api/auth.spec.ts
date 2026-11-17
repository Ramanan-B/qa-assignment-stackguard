import { test, expect } from '../../fixtures/api.fixture';

test.describe('Auth', () => {
  test('valid admin credentials return a token', async ({ booker }) => {
    const res = await booker.auth();

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('wrong password returns no token', async ({ booker }) => {
    const res = await booker.auth('admin', 'not-the-password');

    // The API answers 200 with a reason rather than 401. What matters for
    // security is that no token is issued, so that is what we assert.
    const body = await res.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });
});
