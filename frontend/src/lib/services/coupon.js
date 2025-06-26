import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const couponApi = createApi({
  reducerPath: "couponApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),

  tagTypes: ["Coupons"],

  endpoints: (builder) => ({
    // Get all coupons
    getAllCoupons: builder.query({
      query: () => "/coupons",
      providesTags: ["Coupons"],
    }),

    // Get a coupon by ID
    getCouponById: builder.query({
      query: (id) => `/coupons/${id}`,
      providesTags: ["Coupons"],
    }),

    // Create a new coupon
    addCoupon: builder.mutation({
      query: (newCoupon) => ({
        url: "/coupons",
        method: "POST",
        body: newCoupon,
        credentials: "include",
      }),
      invalidatesTags: ["Coupons"],
    }),

    //apply coupan
    applyCoupon: builder.mutation({
      query: (code) => ({
        url: `/coupons/apply`,
        method: "POST",
        body: { code },
        credentials: "include",
      }),
    }),

    // Update an existing coupon
    updateCoupon: builder.mutation({
      query: ({ id, data }) => ({
        url: `/coupons/${id}`,
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Coupons"],
    }),

    // Delete a coupon
    deleteCoupon: builder.mutation({
      query: (id) => ({
        url: `/coupons/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Coupons"],
    }),
  }),
});

export const {
  useGetAllCouponsQuery,
  useGetCouponByIdQuery,
  useAddCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
  useApplyCouponMutation,
} = couponApi;
