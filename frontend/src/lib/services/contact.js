import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const contactApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),
  tagTypes: ["Contact"],
  endpoints: (builder) => ({
    getAllContacts: builder.query({
      query: () => ({
        url: "/contact",
        method: "GET",
        headers: {},
        credentials: "include",
      }),
      providesTags: ["Contact"],
    }),

    // ADD a new contact
    addContact: builder.mutation({
      query: (formData) => ({
        url: "/contact",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Contact"],
    }),

    // UPDATE an existing contact
    updateContact: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/contact/${id}`,
        method: "PATCH",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Contact"],
    }),

    // DELETE a contact
    deleteContact: builder.mutation({
      query: (id) => ({
        url: `/contact/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Contact"],
    }),
  }),
});

export const {
  useGetAllContactsQuery,
  useAddContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
} = contactApi;

export default contactApi;
