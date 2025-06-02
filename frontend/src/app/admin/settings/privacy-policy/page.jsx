"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";

import {
  useGetAllPrivacyPoliciesQuery,
  useAddPrivacyPolicyMutation,
  useUpdatePrivacyPolicyMutation,
} from "@/lib/services/privacyPolicy";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { PrivacyPolicyValidationSchema } from "@/validation/schemas";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/rich-text-editor";

const PrivacyPolicyManagementPage = () => {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(null);

  // Fetching data and handling mutation actions
  const {
    data: policyList,
    isLoading,
    refetch,
  } = useGetAllPrivacyPoliciesQuery();
  const [addPrivacyPolicy, { isLoading: adding }] =
    useAddPrivacyPolicyMutation();
  const [updatePrivacyPolicy, { isLoading: updating }] =
    useUpdatePrivacyPolicyMutation();

  // Formik form setup for Privacy Policy
  const formik = useFormik({
    initialValues: {
      privacyPolicy: "",
    },
    validationSchema: PrivacyPolicyValidationSchema,
    onSubmit: async (values) => {
      try {
        const action = selectedId
          ? updatePrivacyPolicy({ id: selectedId, formData: values })
          : addPrivacyPolicy(values);

        const res = await action;

        if (res?.data) {
          toast.success(res.data.message || "Operation successful");

          // Refetch updated data after the operation
          await refetch(); // Refetch data from the API

          // Update the form immediately with the most recent data
          const latestPolicy = res?.data?.data || (await refetch())?.data[0];
          if (latestPolicy) {
            formik.setValues({ privacyPolicy: latestPolicy.privacyPolicy });
            setSelectedId(latestPolicy._id);
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
    if (policyList?.length && !selectedId) {
      const [firstPolicy] = policyList;
      formik.setValues({ privacyPolicy: firstPolicy.privacyPolicy });
      setSelectedId(firstPolicy._id);
    }
  }, [policyList, selectedId]);

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
              <BreadcrumbPage>Privacy Policy</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form Section */}
      <div className="bg-white  py-6 px-2 md:px-4 mb-6 max-w-3xl mx-auto shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm">
        <h2 className="text-lg font-bold mb-4 text-primary text-center">
          {selectedId ? "Update Privacy Policy" : "Add Privacy Policy"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <RichTextEditor
            content={formik.values.privacyPolicy}
            onChange={(value) => formik.setFieldValue("privacyPolicy", value)}
          />

          {formik?.touched?.privacyPolicy && formik?.errors?.privacyPolicy && (
            <p className="text-red-600 text-sm">
              {formik.errors.privacyPolicy}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {selectedId
              ? isSubmitting
                ? "Updating..."
                : "Update"
              : isSubmitting
              ? "Adding..."
              : "Add Privacy Policy"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PrivacyPolicyManagementPage;
