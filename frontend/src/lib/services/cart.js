import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const cartApi = createApi({
  tagTypes: ["Carts"],
  reducerPath: "CartsApi",
  baseQuery: fetchBaseQuery({ baseUrl: process.env.NEXT_PUBLIC_BACKEND_URL }),
  endpoints: (builder) => ({
    fetchCart: builder.query({
      query: () => {
        return {
          url: `/cart`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["Carts"],
    }),

    addToCart: builder.mutation({
      query: ({ id, userId }) => ({
        url: "/cart",
        method: "POST",
        headers: {
          "Content-type": "application/json",
        },
        body: { productId: id, quantity: 1 },
        credentials: "include",
      }),
      invalidatesTags: ["Carts"],
    }),

    deleteCartItem: builder.mutation({
      query: ({ productId }) => ({
        url: `/cart/${productId}`,
        method: "DELETE",
        headers: {},
        credentials: "include",
      }),
      invalidatesTags: ["Carts"],
    }),
    deleteAllCartItem: builder.mutation({
      query: () => ({
        url: `/cart/delete-all`,
        method: "DELETE",
        headers: {},
        credentials: "include",
      }),
      invalidatesTags: ["Carts"],
    }),

    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: `/cart/${productId}`,
        method: "PATCH",
        body: { quantity },
        headers: {
          "Content-type": "application/json",
        },
        credentials: "include",
      }),
      invalidatesTags: ["Carts"],
    }),
  }),
});

export const {
  useFetchCartQuery,
  useAddToCartMutation,
  useDeleteCartItemMutation,
  useUpdateCartItemMutation,
  useDeleteAllCartItemMutation,
} = cartApi;

export default cartApi;
