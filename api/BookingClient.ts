import { APIRequestContext, APIResponse } from '@playwright/test';
import { ADMIN, Booking } from '../test-data/bookings';

/**
 * Thin wrapper around the Restful-Booker endpoints. It returns the raw
 * APIResponse so tests can assert on status codes, including failure cases.
 */
export class BookingClient {
  constructor(private readonly request: APIRequestContext) {}

  auth(username = ADMIN.username, password = ADMIN.password): Promise<APIResponse> {
    return this.request.post('/auth', { data: { username, password } });
  }

  /** Returns a valid token, failing loudly if authentication does not work. */
  async token(): Promise<string> {
    const res = await this.auth();
    const body = await res.json();
    if (!res.ok() || typeof body.token !== 'string') {
      throw new Error(`Could not get a token: ${res.status()} ${JSON.stringify(body)}`);
    }
    return body.token;
  }

  create(booking: Partial<Booking>): Promise<APIResponse> {
    return this.request.post('/booking', { data: booking });
  }

  get(id: number | string): Promise<APIResponse> {
    return this.request.get(`/booking/${id}`);
  }

  findIds(params: Record<string, string>): Promise<APIResponse> {
    return this.request.get('/booking', { params });
  }

  update(id: number | string, booking: Booking, token?: string): Promise<APIResponse> {
    return this.request.put(`/booking/${id}`, { data: booking, headers: authHeader(token) });
  }

  patch(id: number | string, fields: Partial<Booking>, token?: string): Promise<APIResponse> {
    return this.request.patch(`/booking/${id}`, { data: fields, headers: authHeader(token) });
  }

  delete(id: number | string, token?: string): Promise<APIResponse> {
    return this.request.delete(`/booking/${id}`, { headers: authHeader(token) });
  }
}

/** Restful-Booker takes the token as a cookie named "token". */
function authHeader(token?: string): Record<string, string> {
  return token === undefined ? {} : { Cookie: `token=${token}` };
}
