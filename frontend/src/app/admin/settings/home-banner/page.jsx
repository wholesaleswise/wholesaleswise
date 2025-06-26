"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetBannerByIdQuery,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useCreateBannerMutation,
  useGetAllBannersQuery,
} from "@/lib/services/banner";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBannerValidationSchema } from "@/validation/schemas";
import { Label } from "@/components/ui/label";
import scrollTop from "@/components/scrollTop";
import Loading from "@/components/Loading";
import Link from "next/link";

const WebsiteBanner = ({ bannerIdToUpdate }) => {
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerIdToUpdateState, setBannerIdToUpdateState] =
    useState(bannerIdToUpdate);

  const { data: response, isLoading: loadingBanners } = useGetAllBannersQuery();
  const { data: bannerData } = useGetBannerByIdQuery(bannerIdToUpdate, {
    skip: !bannerIdToUpdate,
  });

  const [createBanner, { isLoading: addLoading }] = useCreateBannerMutation();
  const [updateBanner, { isLoading: updateLoading }] =
    useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const formik = useFormik({
    initialValues: {
      BannerImage: null,
      productLink: "",
    },
    validationSchema: getBannerValidationSchema(!!bannerIdToUpdateState),
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("productLink", values.productLink);
      if (values.BannerImage) {
        formData.append("BannerImage", values.BannerImage);
      }

      try {
        const res = bannerIdToUpdateState
          ? await updateBanner({
              id: bannerIdToUpdateState,
              updatedBanner: formData,
            })
          : await createBanner(formData);

        if (res?.data) {
          toast.success(`${res?.data?.message}!!!`);
          formik.resetForm();
          setBannerUrl("");
          setBannerIdToUpdateState("");
        } else if (res?.error) {
          toast.error(res?.error?.data?.message || "Request failed.");
        }
      } catch {
        toast.error("An unexpected error occurred.");
      }
    },
  });

  useEffect(() => {
    if (bannerData) {
      setBannerUrl(bannerData.BannerImage);
      formik.setValues({
        productLink: bannerData.productLink || "",
        BannerImage: null,
      });
    }
  }, [bannerData]);

  useEffect(() => {
    return () => {
      if (bannerUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerUrl);
      }
    };
  }, [bannerUrl]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (bannerUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(bannerUrl);
      }
      const imageUrl = URL.createObjectURL(file);
      setBannerUrl(imageUrl);
      formik.setFieldValue("BannerImage", file);
    }
  };

  const handleDeleteBanner = async (id) => {
    try {
      const res = await deleteBanner(id);
      if (res?.data) {
        toast.success(`${res?.data?.message}!!!`);
      } else if (res?.error) {
        toast.error(res?.error?.data?.message || "Deletion failed.");
      }
    } catch {
      toast.error("Error deleting banner.");
    }
  };

  const handleEditBanner = (banner) => {
    setBannerIdToUpdateState(banner._id);
    setBannerUrl(banner.BannerImage);
    formik.setValues({
      productLink: banner.productLink || "",
      BannerImage: null,
    });
    scrollTop();
  };

  if (loadingBanners) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500">
        <Loading />
      </div>
    );
  }
  console.log(formik.values);
  return (
    <div className="container mx-auto p-6 pt-0">
      <div className="py-6">
        {/* Breadcrumb */}
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
              <BreadcrumbPage>Home Page Banner</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="bg-white p-6 max-w-3xl mx-auto shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm">
        <h2 className="text-lg lg:text-xl font-bold mb-4 text-primary text-center">
          {bannerIdToUpdateState ? "Update Banner" : "Create Banner"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Product Link Input */}
          <div>
            <Label
              htmlFor="productLink"
              className="font-semibold mb-2 flex gap-2"
            >
              Product Link URL <span className="text-red-500">*</span>
            </Label>
            <Input
              id="productLink"
              name="productLink"
              type="url"
              placeholder="Enter Product Link"
              {...formik.getFieldProps("productLink")}
              className="w-full"
            />
            {formik.touched.productLink && formik.errors.productLink && (
              <div className="text-red-500 text-xs">
                {formik.errors.productLink}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <Label
              htmlFor="BannerImage"
              className="font-semibold mb-2 flex gap-2"
            >
              Banner Image <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-2">
              {bannerUrl && (
                <div className="relative h-24 w-24 border rounded-md">
                  <img
                    src={bannerUrl}
                    alt="Banner"
                    className="h-full w-full object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (bannerUrl?.startsWith("blob:")) {
                        URL.revokeObjectURL(bannerUrl);
                      }
                      setBannerUrl("");
                      formik.setFieldValue("BannerImage", null);
                    }}
                    className="absolute top-0 right-0 bg-red-500 text-white h-5 w-5 rounded-sm flex items-center justify-center text-xl"
                  >
                    ×
                  </button>
                </div>
              )}
              <div>
                <label className="flex flex-col items-center justify-center p-2 w-24 h-24 cursor-pointer text-center rounded-md shadow-md border transition duration-150 ease-in-out">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 mb-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <div className="text-xs">Add Image</div>
                  <input
                    type="file"
                    onChange={handleImageChange}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
            </div>{" "}
            {formik.touched.BannerImage && formik.errors.BannerImage && (
              <div className="text-red-500 text-xs">
                {formik.errors.BannerImage}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={addLoading || updateLoading}
          >
            {bannerIdToUpdateState
              ? updateLoading
                ? "Saving..."
                : "Save Banner"
              : addLoading
              ? "Adding..."
              : "Create Banner"}
          </Button>
        </form>
      </div>

      {/* Banner List */}
      <div className="pt-10 max-w-3xl mx-auto">
        <h2 className="text-lg lg:text-xl font-bold text-black">
          Banner List:
        </h2>
        {response?.Banners?.length === 0 ? (
          <p className="text-center text-red-600 min-h-[50vh]">
            No banners available.
          </p>
        ) : (
          <div className="border-b overflow-y-auto max-h-screen gap-4 items-center">
            {response?.Banners?.map((banner) => (
              <div
                key={banner._id}
                className="lg:flex items-center justify-between gap-4 p-2 border-b"
              >
                <div className=" items-center">
                  <img
                    src={banner.BannerImage}
                    alt="Banner"
                    className=" object-contain rounded-md"
                  />
                  <div className="py-2 ">
                    Link :
                    <Link
                      href={banner.productLink}
                      className="text-sm lg:text-base text-gray-800 hover:text-primary"
                    >
                      {banner.productLink}
                    </Link>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      handleEditBanner(banner);
                      scrollTop();
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded-md"
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    onClick={() => handleDeleteBanner(banner._id)}
                    className="bg-red-500 text-white p-2 rounded-md"
                  >
                    <FaTrashAlt />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteBanner;
