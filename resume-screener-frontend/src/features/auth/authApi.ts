import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { clearSession } from './authSlice';

export type SessionResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string | null;
  entitlements: string[];
};

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '/api';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  credentials: 'include',
});

export const redirectToLogin = () => {
  if (typeof window !== 'undefined' && typeof window.location?.assign === 'function') {
    window.location.assign('/login');
  }
};

export const baseQueryWithReauth: BaseQueryFn<FetchArgs | string, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  const originalUrl = typeof args === 'string' ? args : args?.url;
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    if (import.meta.env.DEV) {
      console.debug('[baseQueryWithReauth] 401 detected for', originalUrl);
    }

    if (originalUrl === '/auth/refresh') {
      api.dispatch(clearSession());
      redirectToLogin();
      return result;
    }

    const refreshResult = await rawBaseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const retryResult = await rawBaseQuery(args, api, extraOptions);
      if (retryResult.error?.status === 401) {
        if (import.meta.env.DEV) {
          console.debug('[baseQueryWithReauth] Retry also failed with 401; logging out');
        }
        api.dispatch(clearSession());
        redirectToLogin();
      }
      return retryResult;
    }

    if (import.meta.env.DEV) {
      console.debug('[baseQueryWithReauth] Refresh request failed; logging out');
    }
    api.dispatch(clearSession());
    redirectToLogin();
  }

  return result;
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    login: builder.mutation<void, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<void, { name: string; profession: string; email: string; password: string }>({
      query: (body) => ({
        url: '/auth/register',
        method: 'POST',
        body,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getMe: builder.query<SessionResponse, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useLogoutMutation, useLazyGetMeQuery, useGetMeQuery } =
  authApi;
