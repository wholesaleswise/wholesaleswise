"use client";
import { useState, useCallback } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import {
  useGetAllSocialLinksQuery,
  useAddSocialLinkMutation,
  useUpdateSocialLinkMutation,
  useDeleteSocialLinkMutation,
} from "@/lib/services/socialLink";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SocialLinkValidationSchema } from "@/validation/schemas";
import scrollTop from "@/components/scrollTop";
import Loading from "@/components/Loading";
import { FaEdit } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import Link from "next/link";

const SocialLinkManagementPage = () => {
  const { data: socialLinks, error, isLoading } = useGetAllSocialLinksQuery();
  const [selectedId, setSelectedId] = useState(null);
  const [addSocialLink, { isLoading: isAdding }] = useAddSocialLinkMutation();
  const [updateSocialLink, { isLoading: isUpdating }] =
    useUpdateSocialLinkMutation();
  const [deleteSocialLink, { isLoading: isDeleting }] =
    useDeleteSocialLinkMutation();

  const showToast = (
    result,
    successMsg = "Success",
    errorMsg = "An error occurred"
  ) => {
    if (result?.data?.message) {
      toast.success(result.data.message || successMsg);
    } else if (result?.error?.data?.message || result?.error?.data?.error) {
      toast.error(
        result.error.data.message || result.error.data.error || errorMsg
      );
    }
  };

  const formik = useFormik({
    initialValues: {
      socialLinkName: "",
      socialLink: "",
    },
    validationSchema: SocialLinkValidationSchema,
    onSubmit: async (values) => {
      try {
        const isUpdate = Boolean(selectedId);
        const result = await (isUpdate
          ? updateSocialLink({ id: selectedId, formData: values })
          : addSocialLink(values));

        showToast(result);
        if (result?.data?.message) {
          formik.resetForm();
          setSelectedId(null);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "An unexpected error occurred."
        );
      }
    },
  });

  const handleEdit = useCallback(
    (link) => {
      formik.setValues({
        socialLink: link.socialLink,
        socialLinkName: link.socialLinkName,
      });
      setSelectedId(link._id);
      scrollTop();
    },
    [formik]
  );

  const handleDelete = useCallback(
    async (id) => {
      try {
        const result = await deleteSocialLink(id);
        showToast(result, "Deleted successfully", "Delete failed");
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "An unexpected error occurred."
        );
      }
    },
    [deleteSocialLink]
  );

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 pt-0">
      {/* Breadcrumb */}
      <div className="py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Social Link</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="my-2 mx-auto md:max-w-3xl md:w-[80%] lg:w-[60%] pt-6">
        {/* Form Section */}
        <div className="flex flex-col justify-center min-w-60 ">
          <div className="bg-white  px-6 py-10 mb-8 shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm">
            <h2 className="text-lg lg:text-xl font-bold mb-4 text-primary text-center">
              {selectedId ? "Update Social Link" : "Add Social Link"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="socialLinkName"
                  className="font-semibold mb-2 flex gap-2"
                >
                  Social Link Name<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="socialLinkName"
                  name="socialLinkName"
                  type="text"
                  placeholder="facebook"
                  value={formik.values.socialLinkName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.socialLinkName &&
                  formik.errors.socialLinkName && (
                    <p className="text-red-600 text-sm">
                      {formik.errors.socialLinkName}
                    </p>
                  )}
              </div>

              <div>
                <Label
                  htmlFor="socialLink"
                  className="font-semibold mb-2 flex gap-2"
                >
                  Social Link URL<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="socialLink"
                  name="socialLink"
                  type="url"
                  placeholder="https://www.facebook.com"
                  value={formik.values.socialLink}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {formik.touched.socialLink && formik.errors.socialLink && (
                  <p className="text-red-600 text-sm">
                    {formik.errors.socialLink}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isAdding}>
                {selectedId
                  ? isUpdating
                    ? "Updating..."
                    : "Update Social Link"
                  : isAdding
                  ? "Adding..."
                  : "Add Social Link"}
              </Button>
            </form>
          </div>
        </div>

        {/* List Section */}
        <div className=" sm:w-auto overflow-auto max-h-[60vh] pb-5">
          <h2 className="text-lg lg:text-xl font-bold mb-4 text-center pt-6">
            All Social Links
          </h2>
          {error ? (
            <p className="text-center text-red-600 py-10">
              {error?.data?.message}
            </p>
          ) : socialLinks?.length === 0 ? (
            <p className="  text-center text-red-600 py-10">
              No social links found.
            </p>
          ) : (
            <div>
              {socialLinks.map((link) => (
                <div
                  key={link._id}
                  className="border-b py-4 flex gap-4 justify-between items-center"
                >
                  <div>{link.socialLinkName}</div>
                  <div>{link.socialLink}</div>
                  <div className="flex gap-2">
                    <FaEdit
                      size={20}
                      onClick={() => {
                        handleEdit(link);
                        scrollTop();
                      }}
                      className="text-blue-900 cursor-pointer"
                      disabled={isUpdating}
                    />
                    <Trash2
                      size={20}
                      onClick={() => handleDelete(link._id)}
                      className="text-red-600 cursor-pointer"
                      disabled={isDeleting}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialLinkManagementPage;
