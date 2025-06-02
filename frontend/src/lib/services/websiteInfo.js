import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
export const websiteInfoApi = createApi({
  tagTypes: ["Info"],
  reducerPath: "websiteInfoApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/info`,
  }),
  endpoints: (builder) => ({
    getInfo: builder.query({
      query: () => {
        return {
          url: "/website-info",
          method: "GET",
          headers: {},
          credentials: "include",
        };
      },
      providesTags: ["Info"],
    }),

    // Add a Info
    addInfo: builder.mutation({
      query: (formData) => {
        console.log(formData);
        return {
          url: "/website-info",
          method: "POST",
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: ["Info"],
    }),

    // Update logo
    updateInfo: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/website-info/${id}`,
        method: "PATCH",
        body: formData,
        credentials: "include",
      }),
      invalidatesTags: ["Info"],
    }),
  }),
});

export const { useAddInfoMutation, useUpdateInfoMutation, useGetInfoQuery } =
  websiteInfoApi;

export default websiteInfoApi;
