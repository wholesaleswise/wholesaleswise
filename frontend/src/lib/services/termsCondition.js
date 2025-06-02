import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const termsConditionApi = createApi({
  reducerPath: "termsConditionApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),
  tagTypes: ["TermsCondition"],
  endpoints: (builder) => ({
    // GET all terms and conditions
    getAllTerms: builder.query({
      query: () => ({
        url: "/terms-condition",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["TermsCondition"],
    }),

    // ADD a new term
    addTerm: builder.mutation({
      query: (formData) => ({
        url: "/terms-condition",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["TermsCondition"],
    }),

    // UPDATE an existing term
    updateTerm: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/terms-condition/${id}`,
        method: "PATCH",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["TermsCondition"],
    }),

    // DELETE a term
    deleteTerm: builder.mutation({
      query: (id) => ({
        url: `/terms-condition/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["TermsCondition"],
    }),
  }),
});

export const {
  useGetAllTermsQuery,
  useAddTermMutation,
  useUpdateTermMutation,
  useDeleteTermMutation,
} = termsConditionApi;

export default termsConditionApi;
