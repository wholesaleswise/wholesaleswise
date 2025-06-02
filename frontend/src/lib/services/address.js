import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const addressApi = createApi({
  reducerPath: "addressApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/delivery`,
  }),

  tagTypes: ["Addresses"],

  endpoints: (builder) => ({
    // Fetch all addresses
    getAllAddresses: builder.query({
      query: () => "/address",
      providesTags: ["Addresses"],
    }),

    // Fetch a single address by ID
    getAddressById: builder.query({
      query: (id) => `/address/${id}`,
      providesTags: ["Addresses"],
    }),

    // Add a new address
    addAddress: builder.mutation({
      query: (newAddress) => ({
        url: "/address",
        method: "POST",
        body: newAddress,
        credentials: "include",
      }),

      invalidatesTags: ["Addresses"],
    }),

    // Update an address by ID
    updateAddress: builder.mutation({
      query: ({ id, updatedAddress }) => ({
        url: `/address/${id}`,
        method: "PATCH",
        body: updatedAddress,
        credentials: "include",
      }),

      invalidatesTags: ["Addresses"],
    }),

    // Delete an address by ID
    deleteAddress: builder.mutation({
      query: (id) => ({
        url: `/address/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Addresses"],
    }),
  }),
});

export const {
  useGetAllAddressesQuery,
  useGetAddressByIdQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressApi;
