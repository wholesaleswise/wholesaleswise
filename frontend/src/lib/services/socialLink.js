import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";


export const socialLinkApi = createApi({
  reducerPath: "socialLinkApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_BACKEND_URL}/social`,
  }),
  tagTypes: ["SocialLink"],
  endpoints: (builder) => ({
    getAllSocialLinks: builder.query({
      query: () => {
        return {
          url: "/social-link",
          method: "GET",
          headers: {},
          credentials: "include",
        };
      },
      providesTags: ["SocialLink"],
    }),

    // Add a new social link
    addSocialLink: builder.mutation({
      query: (formData) => {
        return {
          url: "/social-link",
          method: "POST",
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: ["SocialLink"],
    }),

    // Update an existing social link
    updateSocialLink: builder.mutation({
      query: ({ id, formData }) => {
        return {
          url: `/social-link/${id}`,
          method: "PATCH",
          body: formData,
          credentials: "include",
        };
      },
      invalidatesTags: ["SocialLink"],
    }),

    // Delete a social link
    deleteSocialLink: builder.mutation({
      query: (id) => {
        return {
          url: `/social-link/${id}`,
          method: "DELETE",
          credentials: "include",
        };
      },
      invalidatesTags: ["SocialLink"],
    }),
  }),
});

export const {
  useGetAllSocialLinksQuery,
  useAddSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
} = socialLinkApi;

export default socialLinkApi;
