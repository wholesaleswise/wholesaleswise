"use client";

import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useAddInfoMutation,
  useUpdateInfoMutation,
  useGetInfoQuery,
} from "@/lib/services/websiteInfo";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Loading from "@/components/Loading";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LogoValidationSchema } from "@/validation/schemas";
import { Textarea } from "@/components/ui/textarea";

const WebsiteLogo = () => {
  const [logoIdToUpdate, setLogoIdToUpdate] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logo, setLogo] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(Date.now());

  // Fetch current logo info
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetInfoQuery();

  const [
    addLogo,
    { isError: addError, isSuccess: addSuccess, isLoading: addLoading },
  ] = useAddInfoMutation();

  const [
    updateLogo,
    {
      isError: updateError,
      isSuccess: updateSuccess,
      isLoading: updateLoading,
    },
  ] = useUpdateInfoMutation();

  // Set fetched data to state
  useEffect(() => {
    if (response?.data) {
      const existingLogo = response.data;
      setLogo(existingLogo);
      setLogoIdToUpdate(existingLogo?._id);
      setLogoUrl(existingLogo?.logoImage || "");
    }
  }, [response?.data]);

  // Formik setup with enableReinitialize
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: logo || {
      logoImage: null,
      websiteName: "",
      supportNumber: "",
      email: "",
      address: "",
      tawkToId: "",
      keywords: "",
    },
    validationSchema: LogoValidationSchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("logoImage", values.logoImage);
      formData.append("websiteName", values.websiteName);
      formData.append("supportNumber", values.supportNumber);
      formData.append("email", values.email);
      formData.append("address", values.address);
      formData.append("tawkToId", values.tawkToId);
      formData.append("keywords", values.keywords);
      try {
        let res;
        if (logoIdToUpdate) {
          res = await updateLogo({ id: logoIdToUpdate, formData });
        } else {
          res = await addLogo(formData);
        }

        if (res?.data) {
          toast.success(`${res.data.message}!!!`);
          await refetch(); // Refresh data
          formik.resetForm();
          setLogoUrl("");
        } else {
          toast.error(res?.error?.data?.message || "Something went wrong");
        }
      } catch (error) {
        toast.error(
          error?.response?.error?.data?.message || "Unexpected error"
        );
      }
    },
  });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoUrl(URL.createObjectURL(file));
      formik.setFieldValue("logoImage", file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] items-center flex justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="container px-4 md:px-6 pb-6 mx-auto">
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
              <BreadcrumbPage>Website Info</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Card */}
      <div className="flex flex-col justify-center items-center">
        <Card className="bg-white shadow-md border p-6 w-full  md:max-w-md">
          <h2 className="text-lg lg:text-xl font-bold mb-4 text-primary text-center py-4">
            {logoIdToUpdate ? "Save Website Info" : "Add New Website Info"}
          </h2>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Website Name */}
            <div>
              <Label className="font-semibold mb-2 flex gap-2">
                Website Name <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="websiteName"
                placeholder="Amazon"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.websiteName}
                className="w-full border px-3 py-2 rounded mt-1"
              />
              {formik.touched.websiteName && formik.errors.websiteName && (
                <p className="text-red-600 text-sm">
                  {formik.errors.websiteName}
                </p>
              )}
            </div>

            {/* Support Number */}
            <div>
              <Label className="font-semibold mb-2 flex gap-2">
                Support Number <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="supportNumber"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.supportNumber}
                placeholder="+61412345678"
                className="w-full border px-3 py-2 rounded mt-1"
              />
              {formik.touched.supportNumber && formik.errors.supportNumber && (
                <p className="text-red-600 text-sm">
                  {formik.errors.supportNumber}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <Label className="font-semibold mb-2 flex gap-2">
                Support Email <span className="text-red-500">*</span>
              </Label>
              <Input
                type="email"
                name="email"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                placeholder="support@example.com"
                className="w-full border px-3 py-2 rounded mt-1"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-600 text-sm">{formik.errors.email}</p>
              )}
            </div>

            {/* Address Field */}
            <div>
              <Label className="font-semibold mb-2 flex gap-2">
                Address <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="address"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.address}
                placeholder="123 Main St, Sydney, Australia"
                className="w-full border px-3 py-2 rounded mt-1"
              />
              {formik.touched.address && formik.errors.address && (
                <p className="text-red-600 text-sm">{formik.errors.address}</p>
              )}
            </div>
            {/* Tawk.to ID Field */}
            <div>
              <Label className="font-semibold mb-2 flex gap-2">
                Tawk.to Widget ID
              </Label>
              <Input
                type="text"
                name="tawkToId"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.tawkToId}
                placeholder="e.g. 682c52c13c7fa5190c19b51f/1irmi6hr6"
                className="w-full border px-3 py-2 rounded mt-1"
              />
              {formik.touched.tawkToId && formik.errors.tawkToId && (
                <p className="text-red-600 text-sm">{formik.errors.tawkToId}</p>
              )}
            </div>
            {/* SEO keywords */}
            <div>
              <Label className="font-semibold mb-2 flex gap-2">
                SEO keywords <span className="text-red-500">*</span>
              </Label>
              <Textarea
                type="text"
                name="keywords"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.keywords}
                placeholder="Enter SEO keywords here..."
                className="w-full border px-3 py-2 rounded mt-1"
              />
              {formik.touched.keywords && formik.errors.keywords && (
                <p className="text-red-600 text-sm">{formik.errors.keywords}</p>
              )}
            </div>

            {/* Logo Upload */}
            <div>
              <Label className="font-semibold">Website Logo</Label>
              <div className="mb-4 flex flex-wrap gap-2 w-full justify-start">
                {logoUrl && (
                  <div className="relative h-24 w-24 border rounded-md">
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="h-full w-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoUrl("");
                        formik.setFieldValue("logoImage", null);
                        setFileInputKey(Date.now());
                      }}
                      className="absolute top-0 bg-red-500 right-0 h-5 w-5 text-white hover:bg-red-600 items-center flex justify-center pb-1 rounded-sm text-2xl"
                    >
                      ×
                    </button>
                  </div>
                )}

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
                    key={fileInputKey}
                    onChange={handleImageUpload}
                    className="hidden"
                    accept="image/*"
                  />
                </label>
              </div>
              {formik.touched.logoImage && formik.errors.logoImage && (
                <p className="text-red-600 text-sm">
                  {formik.errors.logoImage}
                </p>
              )}
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={addLoading || updateLoading}
            >
              {logoIdToUpdate
                ? updateLoading
                  ? "Saving..."
                  : "Save Website Logo"
                : addLoading
                ? "Adding..."
                : "Add Website Logo"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default WebsiteLogo;
