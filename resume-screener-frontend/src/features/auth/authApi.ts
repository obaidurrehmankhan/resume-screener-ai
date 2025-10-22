import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export type SessionResponse = {
  id: string;
  email: string;
  name: string;
  role: string;
  plan: string | null;
  entitlements: string[];
};

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    credentials: 'include',
  }),
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
