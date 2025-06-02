import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const authApi = createApi({
  tagTypes: ["Users"],
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/user`,
  }),

  endpoints: (builder) => ({
    createUser: builder.mutation({
      query: (user) => {
        return {
          url: "register",
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
      invalidatesTags: ["Users"],
    }),

    verifyEmail: builder.mutation({
      query: (user) => {
        return {
          url: `verify-email`,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
      invalidatesTags: ["Users"],
    }),

    loginUser: builder.mutation({
      query: (user) => {
        return {
          url: `login`,
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
          credentials: "include",
        };
      },
      invalidatesTags: ["Users"],
    }),
    getUser: builder.query({
      query: () => {
        return {
          url: `me`,
          method: "GET",

          credentials: "include",
        };
      },
      providesTags: ["Users"],
    }),
    getProtected: builder.query({
      query: () => {
        return {
          url: `user-protect`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["Users"],
    }),

    logoutUser: builder.mutation({
      query: () => {
        return {
          url: `logout`,
          method: "POST",
          body: {},
          credentials: "include",
        };
      },
      invalidatesTags: ["Users"],
    }),

    resetPasswordLink: builder.mutation({
      query: (user) => {
        return {
          url: "reset-password-link",
          method: "POST",
          body: user,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
      invalidatesTags: ["Users"],
    }),

    resetPassword: builder.mutation({
      query: (data) => {
        const { id, token, ...values } = data;
        const actualData = { ...values };
        return {
          url: `/reset-password/${id}/${token}`,
          method: "POST",
          body: actualData,
          headers: {
            "Content-type": "application/json",
          },
        };
      },
      invalidatesTags: ["Users"],
    }),

    changePassword: builder.mutation({
      query: (actualData) => {
        return {
          url: "change-password",
          method: "POST",
          body: actualData,
          credentials: "include",
        };
      },
      invalidatesTags: ["Users"],
    }),

    getAllUser: builder.query({
      query: () => {
        return {
          url: "/get-all-users",
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["Users"],
    }),

    EditUser: builder.mutation({
      query: ({ updatedUser, userId }) => {
        return {
          url: `/edit-user/${userId}`,
          method: "PATCH",
          body: updatedUser,
          credentials: "include",
        };
      },

      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useCreateUserMutation,
  useVerifyEmailMutation,
  useLoginUserMutation,
  useGetUserQuery,
  useLogoutUserMutation,
  useResetPasswordLinkMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useGetAllUserQuery,
  useEditUserMutation,
  useGetProtectedQuery,
} = authApi;
