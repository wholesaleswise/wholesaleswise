"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import {
  useCreateCategoryMutation,
  useGetSingleCategoryQuery,
  useUpdateCategoryMutation,
} from "@/lib/services/category";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import AOS from "aos";
import "aos/dist/aos.css";

import { categorySchema } from "@/validation/schemas";
import Link from "next/link";

export default function CategoryForm({ slug }) {
  const error = "text-xs text-red-600 pt-1";
  const [categoryImage, setCategoryImage] = useState(null);
  const [category, setCategory] = useState(null);
  const [categoryId, setCategoryId] = useState(null);
  const router = useRouter();
  const {
    data: singleCategoryData,
    status: getsingleCategoryStatus,
    isError: getsingleCategoryError,
    isSuccess: getsingleCategorySuccess,
  } = useGetSingleCategoryQuery(slug, {
    skip: !slug,
  });

  useEffect(() => {
    if (slug) {
      if (getsingleCategorySuccess || singleCategoryData) {
        setCategory(singleCategoryData?.category);
        setCategoryId(singleCategoryData?.category?._id);
      } else if (getsingleCategoryError) {
        toast.error(`${getsingleCategoryStatus?.error?.data?.error}..`);
      }
    }
  }, [
    slug,
    getsingleCategorySuccess,
    singleCategoryData,
    getsingleCategoryError,
    getsingleCategoryStatus,
  ]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [category]);

  const [
    createCategory,
    {
      isLoading: createLoading,
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreateCategoryMutation();

  const [
    updateCategory,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdateCategoryMutation();

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
  } = useFormik({
    enableReinitialize: true,
    initialValues: category || {
      categoryName: "",
      categoryImage: "",
    },
    validationSchema: categorySchema,
    onSubmit: async (values) => {
      const formData = new FormData();
      formData.append("categoryName", values.categoryName);
      formData.append("categoryImage", values.categoryImage);

      if (categoryId) {
        const response = await updateCategory({ id: categoryId, formData });
        if (updateSuccess || response?.data) {
          toast.success(`${response?.data?.message}!!!`);
          resetForm();
          setCategoryImage(null);
          router.push("/admin/category");
        } else if (updateError) {
          toast.error(`${updateErrorDetails?.data?.message}..`);
        }
      } else {
        const response = await createCategory(formData);
        try {
          if (createSuccess || response?.data) {
            toast.success(`${response?.data?.message}!!!`);
            resetForm();
            setCategoryImage(null);
            router.push("/admin/category");
          } else if (createError) {
            toast.error(`${createErrorDetails?.data?.message}..`);
          }
        } catch (error) {
          toast.error(error?.data?.message);
        }
      }
    },
  });

  const uploadImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCategoryImage(URL.createObjectURL(file));
      setFieldValue("categoryImage", file);
    }
  };

  return (
    <div className="w-full mb-6 ">
      <div className="py-6 px-4 sm:px-6 md:pl-8 ">
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
              <BreadcrumbPage>Add Category</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div
        className="w-full max-w-md mx-auto pt-5 pb-4 md:pt-10"
        data-aos="fade-up"
      >
        <form
          onSubmit={handleSubmit}
          encType="multipart/form-data"
          className="space-y-6 p-6 m-4 lg:w-[90%] lg:mx-auto md:mt-8 bg-white shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm"
        >
          <h2 className="text-lg lg:text-xl font-bold mb-4 text-primary text-center">
            {slug ? "Update Category" : "Add New Category"}
          </h2>

          <div className="space-y-4">
            <div>
              <Label
                htmlFor="categoryName"
                className="flex mb-1 gap-2 font-semibold"
              >
                Category Name <p className="text-red-500">*</p>
              </Label>
              <Input
                name="categoryName"
                type="text"
                placeholder="Enter category name"
                value={values.categoryName}
                className="w-full p-3 border  text-sm border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
              />
              {errors.categoryName && (
                <div className={`${error}`}>{errors.categoryName}</div>
              )}
            </div>

            <div>
              <Label
                htmlFor="categoryImage"
                className="flex mb-1 gap-2 font-semibold"
              >
                Category Image <p className="text-red-500">*</p>
              </Label>
              <div className="mb-4 flex flex-wrap gap-2 w-full justify-start">
                {categoryImage && (
                  <div className="relative h-24 w-24 border rounded-md">
                    <img
                      src={categoryImage}
                      alt="Category"
                      className="h-full w-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => setCategoryImage(null)}
                      className="absolute top-0 bg-red-500 right-0 h-5 w-5 text-white hover:bg-red-600 items-center flex justify-center pb-1 rounded-sm text-2xl"
                    >
                      ×
                    </button>
                  </div>
                )}

                {!categoryImage && category?.categoryImage && (
                  <div className="relative h-24 w-24 border rounded-md">
                    <img
                      src={category.categoryImage}
                      alt="Category"
                      className="h-full w-full object-contain rounded-md"
                    />
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
                    onChange={uploadImage}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.categoryImage && (
                <div className={`${error}`}>{errors.categoryImage}</div>
              )}
            </div>

            <Button type="submit" className="w-full">
              {createLoading || updateLoading
                ? "Submitting..."
                : slug
                ? "Update Category"
                : "Submit Category"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
