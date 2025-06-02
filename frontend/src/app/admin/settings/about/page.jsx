"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  useGetAllAboutQuery,
  useAddAboutMutation,
  useUpdateAboutMutation,
} from "@/lib/services/about";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { AboutValidationSchema } from "@/validation/schemas";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/rich-text-editor";

const AboutUsManagementPage = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);

  // Fetch data and mutation hooks
  const { data: aboutList, isLoading, refetch } = useGetAllAboutQuery();
  const [addAbout, { isLoading: adding }] = useAddAboutMutation();
  const [updateAbout, { isLoading: updating }] = useUpdateAboutMutation();

  const formik = useFormik({
    initialValues: {
      aboutContent: "",
    },
    validationSchema: AboutValidationSchema,
    onSubmit: async (values) => {
      try {
        const action = selectedId
          ? updateAbout({ id: selectedId, formData: values })
          : addAbout(values);

        const res = await action;

        if (res?.data) {
          toast.success(res.data.message || "Operation successful");

          // Refetch updated data after adding/updating
          await refetch(); // Refetch data to ensure the latest content

          // Set form values with the updated content
          const updatedAbout = res?.data?.data || (await refetch())?.data[0];
          if (updatedAbout) {
            formik.setValues({ aboutContent: updatedAbout.aboutContent });
            setSelectedId(updatedAbout._id);
          } else {
            formik.resetForm();
            setSelectedId(null);
          }
        } else {
          toast.error(res?.error?.data?.message || "Something went wrong");
        }
      } catch (err) {
        toast.error(err?.message || "Unexpected error");
      }
    },
  });

  useEffect(() => {
    if (aboutList?.length && !selectedId) {
      const [firstAbout] = aboutList;
      formik.setValues({ aboutContent: firstAbout.aboutContent });
      formik.setTouched({ aboutContent: false });
      setSelectedId(firstAbout._id);
    }
  }, [aboutList, selectedId]);

  const isSubmitting = adding || updating;

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
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>About Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Section */}
      <div className="bg-white py-6 px-2 md:px-4 mb-6 max-w-3xl mx-auto shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm ">
        <h2 className="text-lg font-bold mb-4 text-primary text-center">
          {selectedId ? "Update About Us" : "Add About Us"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <RichTextEditor
            content={formik.values.aboutContent}
            onChange={(value) => formik.setFieldValue("aboutContent", value)}
            onBlur={() => formik.setFieldTouched("aboutContent", true)}
          />

          {formik.touched.aboutContent && formik.errors.aboutContent && (
            <p className="text-red-600 text-sm">{formik.errors.aboutContent}</p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {selectedId
              ? isSubmitting
                ? "Updating..."
                : "Update"
              : isSubmitting
              ? "Adding..."
              : "Add About Us"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AboutUsManagementPage;
