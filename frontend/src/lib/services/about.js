import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const aboutApi = createApi({
  reducerPath: "aboutApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),
  tagTypes: ["About"],
  endpoints: (builder) => ({
    // GET all about entries
    getAllAbout: builder.query({
      query: () => ({
        url: "/about-us",
        method: "GET",
      }),
      providesTags: ["About"],
    }),

    // ADD new about entry
    addAbout: builder.mutation({
      query: (formData) => ({
        url: "/about-us",
        method: "POST",
        body: formData,

        credentials: "include",
      }),
      invalidatesTags: ["About"],
    }),

    // UPDATE about entry
    updateAbout: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/about-us/${id}`,
        method: "PATCH",
        body: formData,

        credentials: "include",
      }),
      invalidatesTags: ["About"],
    }),

    // DELETE about entry
    deleteAbout: builder.mutation({
      query: (id) => ({
        url: `/about-us/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["About"],
    }),
  }),
});

export const {
  useGetAllAboutQuery,
  useAddAboutMutation,
  useUpdateAboutMutation,
  useDeleteAboutMutation,
} = aboutApi;

export default aboutApi;
