import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const categoryApi = createApi({
  reducerPath: "categoriesApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}`,
  }),
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    createCategory: builder.mutation({
      query: (formData) => {
        console.log(formData);
        return {
          url: "/category",
          method: "POST",
          body: formData,
          headers: {},
          credentials: "include",
        };
      },
      invalidatesTags: ["Categories"],
    }),

    updateCategory: builder.mutation({
      query: ({ formData, id }) => {
        return {
          url: `/category/${id}`,
          method: "PATCH",
          body: formData,
          headers: {},
          credentials: "include",
        };
      },
      invalidatesTags: ["Categories"],
    }),

    getAllCategory: builder.query({
      query: () => {
        return {
          url: "/category",
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["Categories"],
    }),

    getSingleCategory: builder.query({
      query: (slug) => {
        return {
          url: `/category/${slug}`,
          method: "GET",
          credentials: "include",
        };
      },
      providesTags: ["Categories"],
    }),

    deleteCategory: builder.mutation({
      query: (id) => {
        console.log(id);
        return {
          url: `/category/${id}`,
          method: "DELETE",
          headers: {},
          credentials: "include",
        };
      },
      invalidatesTags: ["Categories"],
    }),
  }),
});
export const {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetAllCategoryQuery,
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
} = categoryApi;
