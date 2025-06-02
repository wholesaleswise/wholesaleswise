// import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// export const productApi = createApi({
//   tagTypes: ["Products"],
//   reducerPath: "ProductsApi",
//   baseQuery: fetchBaseQuery({
//     baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
//   }),

//   endpoints: (builder) => ({
//     createProduct: builder.mutation({
//       query: (formData) => {
//         console.log(formData);
//         return {
//           url: "/product",
//           method: "POST",
//           body: formData,
//           credentials: "include",
//         };
//       },

//       invalidatesTags: ["Products"],
//     }),

//     updateProduct: builder.mutation({
//       query: ({ formData, id }) => {
//         return {
//           url: `/product/${id}`,
//           method: "PATCH",
//           body: formData,
//           credentials: "include",
//         };
//       },
//       invalidatesTags: ["Products"],
//     }),
//     getAllReviews: builder.query({
//       query: () => {
//         return {
//           url: "/product/review/all",
//           method: "GET",
//           credentials: "include",
//         };
//       },
//       providesTags: ["Products"],
//     }),
//     getAllProduct: builder.query({
//       query: () => {
//         return {
//           url: "/product",
//           method: "GET",
//           credentials: "include",
//         };
//       },
//       providesTags: ["Products"],
//     }),

//     getCategoryWiseProduct: builder.query({
//       query: ({ category }) => {
//         return {
//           url: `/product/category-wise-product/${category}`,
//           method: "GET",
//           credentials: "include",
//         };
//       },
//       providesTags: ["Products"],
//     }),

//     getSingleProduct: builder.query({
//       query: (slug) => {
//         return {
//           url: `/product/${slug}`,
//           method: "GET",
//           credentials: "include",
//         };
//       },
//       providesTags: ["Products"],
//     }),

//     deleteProduct: builder.mutation({
//       query: (id) => {
//         return {
//           url: `/product/${id}`,
//           method: "DELETE",
//           credentials: "include",
//         };
//       },
//       invalidatesTags: ["Products"],
//     }),

//     EditReview: builder.mutation({
//       query: ({ reviewData, slug, reviewId }) => {
//         return {
//           url: `/product/review/${slug}/${reviewId}`,
//           method: "PATCH",
//           body: reviewData,
//           credentials: "include",
//         };
//       },
//       invalidatesTags: ["Products"],
//     }),

//     EditReviewStatus: builder.mutation({
//       query: (data) => {
//         return {
//           url: "/product/review/status",
//           method: "PATCH",
//           body: data,
//           credentials: "include",
//         };
//       },
//       invalidatesTags: ["Products"],
//     }),

//     deleteReview: builder.mutation({
//       query: ({ slug, reviewId }) => {
//         return {
//           url: `/product/review/${slug}/${reviewId}`,
//           method: "DELETE",
//           credentials: "include",
//         };
//       },
//       invalidatesTags: ["Products"],
//     }),

//     addReview: builder.mutation({
//       query: ({ slug, reviewData }) => ({
//         url: `/product/review/${slug}`,
//         method: "POST",
//         body: reviewData,

//         credentials: "include",
//       }),
//       invalidatesTags: ["Products"],
//     }),
//   }),
// });

// export const {
//   useCreateProductMutation,
//   useGetAllProductQuery,
//   useDeleteProductMutation,
//   useUpdateProductMutation,
//   useGetSingleProductQuery,
//   useAddReviewMutation,
//   useDeleteReviewMutation,
//   useEditReviewMutation,
//   useGetAllReviewsQuery,
//   useEditReviewStatusMutation,
//   useGetCategoryWiseProductQuery,
// } = productApi;

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Helper function to create a product-specific review tag
const productReviewTag = (slug) => ({
  type: "ProductReviews",
  id: slug,
});

export const productApi = createApi({
  tagTypes: ["Products", "ProductReviews"], // Add the new tag type
  reducerPath: "ProductsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),

  endpoints: (builder) => ({
    createProduct: builder.mutation({
      query: (formData) => ({
        url: "/product",
        method: "POST",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Products"],
    }),

    updateProduct: builder.mutation({
      query: ({ formData, id }) => ({
        url: `/product/${id}`,
        method: "PATCH",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Products"],
    }),

    getAllReviews: builder.query({
      query: () => ({
        url: "/product/review/all",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Products"], // Might want to rethink this tag
    }),

    getAllProduct: builder.query({
      query: () => ({
        url: "/product",
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Products"],
    }),

    getCategoryWiseProduct: builder.query({
      query: ({ category }) => ({
        url: `/product/category-wise-product/${category}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: ["Products"],
    }),

    getSingleProduct: builder.query({
      query: (slug) => ({
        url: `/product/${slug}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (result, error, slug) => [
        "Products",
        productReviewTag(slug), // Provide the product-specific review tag
      ],
    }),

    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/product/${id}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: ["Products"],
    }),

    EditReview: builder.mutation({
      query: ({ reviewData, slug, reviewId }) => ({
        url: `/product/review/${slug}/${reviewId}`,
        method: "PATCH",
        body: reviewData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { slug }) => [productReviewTag(slug)], // Invalidate the specific product's reviews
    }),

    EditReviewStatus: builder.mutation({
      query: (data) => ({
        url: "/product/review/status",
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Products"], // Consider if this should invalidate specific product reviews
    }),

    deleteReview: builder.mutation({
      query: ({ slug, reviewId }) => ({
        url: `/product/review/${slug}/${reviewId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, { slug }) => [productReviewTag(slug)], // Invalidate the specific product's reviews
    }),

    addReview: builder.mutation({
      query: ({ slug, reviewData }) => ({
        url: `/product/review/${slug}`,
        method: "POST",
        body: reviewData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { slug }) => [productReviewTag(slug)], // Invalidate the specific product's reviews
    }),
  }),
});

export const {
  useCreateProductMutation,
  useGetAllProductQuery,
  useDeleteProductMutation,
  useUpdateProductMutation,
  useGetSingleProductQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
  useEditReviewMutation: useEditReviewMutationRTK,
  useGetAllReviewsQuery,
  useEditReviewStatusMutation,
  useGetCategoryWiseProductQuery,
} = productApi;
