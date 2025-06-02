import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const bannerApi = createApi({
  tagTypes: ["Banner"],
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),

  endpoints: (builder) => ({
    // Fetch all banners
    getAllBanners: builder.query({
      query: () => {
        return {
          url: "/banner",
          method: "GET",
          headers: {},
          credentials: "include",
        };
      },
      providesTags: ["Banner"],
    }),

    // Add a new banner
    createBanner: builder.mutation({
      query: (newBanner) => {
        return {
          url: "/banner",
          method: "POST",
          body: newBanner,
          credentials: "include",
        };
      },
      invalidatesTags: ["Banner"],
    }),

    // Fetch a banner by ID
    getBannerById: builder.query({
      query: (id) => {
        return {
          url: `/banner/${id}`,
          method: "GET",

          headers: {},
          credentials: "include",
        };
      },
      providesTags: ["Banner"],
    }),

    // Update an existing banner
    updateBanner: builder.mutation({
      query: ({ id, updatedBanner }) => {
        return {
          url: `/banner/${id}`,
          method: "PATCH",
          body: updatedBanner,
          credentials: "include",
        };
      },
      invalidatesTags: ["Banner"],
    }),

    // Delete a banner
    deleteBanner: builder.mutation({
      query: (id) => {
        return {
          url: `/banner/${id}`,
          method: "DELETE",
          credentials: "include",
        };
      },
      invalidatesTags: ["Banner"],
    }),
  }),
});

export const {
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useGetBannerByIdQuery,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
} = bannerApi;

export default bannerApi;
