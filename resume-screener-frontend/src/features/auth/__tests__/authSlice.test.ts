import { describe, expect, it } from 'vitest';
import reducer, { clearSession, setSession } from '../authSlice';

describe('authSlice session flow', () => {
  it('sets then clears session data', () => {
    const populated = reducer(undefined, setSession({
      user: { id: '1', name: 'Ada', email: 'ada@example.com', role: 'PRO' },
      plan: 'PRO', entitlements: ['ATS_VIEW']
    }));
    expect(populated.user?.email).toBe('ada@example.com');
    expect(reducer(populated, clearSession()).user).toBeNull();
  });
});
