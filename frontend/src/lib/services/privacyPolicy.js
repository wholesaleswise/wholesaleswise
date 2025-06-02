import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const privacyPolicyApi = createApi({
  reducerPath: "privacyPolicyApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),
  tagTypes: ["PrivacyPolicy"],
  endpoints: (builder) => ({
    // GET all privacy policies
    getAllPrivacyPolicies: builder.query({
      query: () => ({
        url: "/privacy-policy",
        method: "GET",
      }),
      providesTags: ["PrivacyPolicy"],
    }),

    // ADD a new privacy policy
    addPrivacyPolicy: builder.mutation({
      query: (formData) => ({
        url: "/privacy-policy",
        method: "POST",
        body: formData,
        headers: {},
        credentials: "include",
      }),
      invalidatesTags: ["PrivacyPolicy"],
    }),

    // UPDATE an existing privacy policy
    updatePrivacyPolicy: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/privacy-policy/${id}`,
        method: "PATCH",
        body: formData,
        headers: {},
        credentials: "include",
      }),
      invalidatesTags: ["PrivacyPolicy"],
    }),

    // DELETE a privacy policy
    deletePrivacyPolicy: builder.mutation({
      query: (id) => ({
        url: `/privacy-policy/${id}`,
        method: "DELETE",
        headers: {},
        credentials: "include",
      }),
      invalidatesTags: ["PrivacyPolicy"],
    }),
  }),
});

export const {
  useGetAllPrivacyPoliciesQuery,
  useAddPrivacyPolicyMutation,
  useUpdatePrivacyPolicyMutation,
  useDeletePrivacyPolicyMutation,
} = privacyPolicyApi;

export default privacyPolicyApi;
