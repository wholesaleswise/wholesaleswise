import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// product-specific review tag
const productReviewTag = (slug) => ({
  type: "ProductReviews",
  id: slug,
});

export const productApi = createApi({
  tagTypes: ["Products", "ProductReviews"],
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
      providesTags: ["Products"],
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

    getProductsByDiscount: builder.query({
      query: (discount) => ({
        url: `/product/discount/${discount}`,
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
        productReviewTag(slug),
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
      invalidatesTags: (result, error, { slug }) => [productReviewTag(slug)],
    }),

    EditReviewStatus: builder.mutation({
      query: (data) => ({
        url: "/product/review/status",
        method: "PATCH",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: ["Products"],
    }),

    deleteReview: builder.mutation({
      query: ({ slug, reviewId }) => ({
        url: `/product/review/${slug}/${reviewId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (result, error, { slug }) => [productReviewTag(slug)],
    }),

    addReview: builder.mutation({
      query: ({ slug, reviewData }) => ({
        url: `/product/review/${slug}`,
        method: "POST",
        body: reviewData,
        credentials: "include",
      }),
      invalidatesTags: (result, error, { slug }) => [productReviewTag(slug)],
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
  useGetProductsByDiscountQuery,
} = productApi;
