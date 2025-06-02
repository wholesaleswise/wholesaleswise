"use client";

import { useState, useEffect } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import Link from "next/link";

import {
  useGetAllTermsQuery,
  useAddTermMutation,
  useUpdateTermMutation,
} from "@/lib/services/termsCondition";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { TermsValidationSchema } from "@/validation/schemas";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/rich-text-editor";

const TermsConditionManagementPage = () => {
  const [selectedId, setSelectedId] = useState(null);

  const { data: termsList, isLoading, refetch } = useGetAllTermsQuery();
  const [addTerm, { isLoading: adding }] = useAddTermMutation();
  const [updateTerm, { isLoading: updating }] = useUpdateTermMutation();

  const formik = useFormik({
    initialValues: { termsCondition: "" },
    validationSchema: TermsValidationSchema,
    onSubmit: async (values) => {
      try {
        const action = selectedId
          ? updateTerm({ id: selectedId, formData: values })
          : addTerm(values);

        const res = await action;

        if (res?.data) {
          toast.success(res.data.message || "Operation successful");

          const { data: updatedTerms } = await refetch();
          const latest = updatedTerms?.[0];

          if (latest) {
            formik.setValues({ termsCondition: latest.termsCondition });
            setSelectedId(latest._id);
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
    if (termsList?.length) {
      const [firstTerm] = termsList;
      formik.setValues({ termsCondition: firstTerm.termsCondition });
      setSelectedId(firstTerm._id);
    }
  }, [termsList]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500">
        <Loading />
      </div>
    );
  }

  const isSubmitting = adding || updating;

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
              <BreadcrumbPage>Terms & Conditions</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form */}
      <div className="bg-white  py-6 px-2 md:px-4  p-6 mb-6 max-w-3xl mx-auto shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm">
        <h2 className="text-lg font-bold text-center mb-4 text-primary">
          {selectedId ? "Update Terms & Conditions" : "Add Terms & Conditions"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <RichTextEditor
            content={formik.values.termsCondition}
            onChange={(value) => formik.setFieldValue("termsCondition", value)}
          />

          {formik.errors.termsCondition && (
            <p className="text-red-600 text-sm">
              {formik.errors.termsCondition}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {selectedId
              ? isSubmitting
                ? "Updating..."
                : "Update"
              : isSubmitting
              ? "Adding..."
              : "Add Terms & Conditions"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default TermsConditionManagementPage;
