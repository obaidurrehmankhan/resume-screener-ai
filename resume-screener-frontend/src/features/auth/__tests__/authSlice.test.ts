import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import type { BaseQueryApi } from '@reduxjs/toolkit/query';
import * as authApiModule from '../authApi';
import reducer, { setSession } from '../authSlice';
import { selectHasEntitlement } from '../authSelectors';

const createResponse = (body: unknown, init: ResponseInit) =>
  new Response(body === null ? null : JSON.stringify(body), {
    headers: body === null ? undefined : { 'Content-Type': 'application/json' },
    ...init,
  });

describe('baseQueryWithReauth', () => {
  const dispatch = vi.fn();
  const api = {
    dispatch,
    getState: () => ({}),
    extra: undefined,
    endpoint: 'test',
    type: 'query',
    signal: new AbortController().signal,
  } as unknown as BaseQueryApi;

  beforeEach(() => {
    dispatch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('refreshes once after a 401 and retries original request', async () => {
    const originalFetch = global.fetch;
    const redirectSpy = vi
      .spyOn(authApiModule, 'redirectToLogin')
      .mockImplementation(() => undefined);

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce(createResponse(null, { status: 401 }))
      .mockResolvedValueOnce(createResponse({}, { status: 200 }))
      .mockResolvedValueOnce(createResponse({ ok: true }, { status: 200 }));

    const result = await authApiModule.baseQueryWithReauth('/protected', api, {});

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(redirectSpy).not.toHaveBeenCalled();
    expect(dispatch).not.toHaveBeenCalled();
    expect(result.data).toEqual({ ok: true });

    global.fetch = originalFetch;
    redirectSpy.mockRestore();
  });
});

describe('selectHasEntitlement', () => {
  it('returns true when entitlement exists', () => {
    const authState = reducer(
      undefined,
      setSession({
        user: { id: '1', name: 'Ada', email: 'ada@example.com', role: 'PRO' },
        plan: 'PRO',
        entitlements: ['ATS_VIEW', 'EXPORT'],
      }),
    );

    const mockState = { auth: authState } as { auth: ReturnType<typeof reducer> };
    expect(selectHasEntitlement(mockState, 'EXPORT')).toBe(true);
  });
});
