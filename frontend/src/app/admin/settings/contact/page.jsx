"use client";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import Link from "next/link";

import {
  useGetAllContactsQuery,
  useAddContactMutation,
  useUpdateContactMutation,
} from "@/lib/services/contact";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { ContactValidationSchema } from "@/validation/schemas";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/rich-text-editor";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ContactManagementPage = () => {
  const [selectedId, setSelectedId] = useState(null);

  const { data: contactList, isLoading, refetch } = useGetAllContactsQuery();
  const [addContact, { isLoading: adding }] = useAddContactMutation();
  const [updateContact, { isLoading: updating }] = useUpdateContactMutation();

  const formik = useFormik({
    initialValues: {
      contactContent: "",
      mapEmbedUrl: "",
    },
    validationSchema: ContactValidationSchema,
    onSubmit: async (values) => {
      try {
        const action = selectedId
          ? updateContact({ id: selectedId, formData: values })
          : addContact(values);

        const res = await action;

        if (res?.data) {
          toast.success(res.data.message || "Operation successful");

          const { data: updatedList } = await refetch();
          const updated = updatedList?.[0];

          if (updated) {
            formik.setValues({
              contactContent: updated.contactContent || "",
              mapEmbedUrl: updated.mapEmbedUrl || "",
            });
            setSelectedId(updated._id);
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
    if (contactList?.length) {
      const [firstContact] = contactList;
      formik.setValues({
        contactContent: firstContact.contactContent || "",
        mapEmbedUrl: firstContact.mapEmbedUrl || "",
      });
      setSelectedId(firstContact._id);
    }
  }, [contactList]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500">
        <Loading />
      </div>
    );
  }

  const isSubmitting = adding || updating;

  return (
    <div className="container mx-auto p-4 pt-0 pb-6">
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
              <BreadcrumbPage>Contact Us</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Form */}
      <div className="bg-white  py-6 px-2 md:px-4  mb-6 max-w-3xl mx-auto shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm">
        <h2 className="text-lg font-bold mb-4 text-primary text-center">
          {selectedId ? "Update Contact Info" : "Add Contact Info"}
        </h2>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Contact Content */}
          <div>
            <Label
              htmlFor="contactContent"
              className="font-semibold mb-2 flex gap-2"
            >
              Contact Content <span className="text-red-500">*</span>
            </Label>
            <RichTextEditor
              content={formik.values.contactContent}
              onChange={(value) =>
                formik.setFieldValue("contactContent", value)
              }
              onBlur={() => formik.setFieldTouched("contactContent", true)}
            />
            {formik.touched.contactContent && formik.errors.contactContent && (
              <p className="text-red-600 text-sm">
                {formik.errors.contactContent}
              </p>
            )}
          </div>

          {/* Google Maps Embed URL */}
          <div>
            <Label
              htmlFor="mapEmbedUrl"
              className="font-semibold mb-2 flex gap-2"
            >
              Google Maps Embed URL <span className="text-red-500">*</span>
            </Label>
            <Input
              name="mapEmbedUrl"
              placeholder="Google Maps Embed URL"
              value={formik.values.mapEmbedUrl}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full"
            />
            {formik.touched.mapEmbedUrl && formik.errors.mapEmbedUrl && (
              <p className="text-red-600 text-sm">
                {formik.errors.mapEmbedUrl}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {selectedId
              ? isSubmitting
                ? "Updating..."
                : "Update"
              : isSubmitting
              ? "Adding..."
              : "Add Contact Info"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ContactManagementPage;
