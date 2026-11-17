// Public test accounts listed on the Sauce Demo login page.
export const PASSWORD = 'secret_sauce';

export const USERS = {
  standard: 'standard_user',
  lockedOut: 'locked_out_user',
  problem: 'problem_user',
  error: 'error_user',
  visual: 'visual_user',
} as const;

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

/** Unique customer details for each test, so runs never share data. */
export function newCustomer(): Customer {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return { firstName: 'QA', lastName: `Tester${id}`, postalCode: '560001' };
}
