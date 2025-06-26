"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaEdit } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import Loading from "@/components/Loading";
import {
  useAddCouponMutation,
  useDeleteCouponMutation,
  useGetAllCouponsQuery,
  useUpdateCouponMutation,
} from "@/lib/services/coupon";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import scrollTop from "@/components/scrollTop";
import Link from "next/link";

// 🔧 Converts UTC time to browser-local time for datetime-local input
const toLocalDateTimeInput = (utcDate) => {
  const date = new Date(utcDate);
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60000);
  return localDate.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
};

const couponSchema = Yup.object({
  code: Yup.string().required("Coupon code is required"),
  discount: Yup.number().min(1).max(100).required("Discount is required"),
  expiresAt: Yup.date().required("Expiry date and time is required"),
});

const CouponPage = () => {
  const [editingId, setEditingId] = useState(null);

  const { data: coupons = [], isLoading, error } = useGetAllCouponsQuery();
  const [addCoupon] = useAddCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const formik = useFormik({
    initialValues: {
      code: "",
      discount: "",
      expiresAt: "",
    },
    validationSchema: couponSchema,
    onSubmit: async (values) => {
      try {
        if (editingId) {
          const res = await updateCoupon({ id: editingId, data: values });
          toast.success(res?.data?.message || "Coupon updated!");
        } else {
          const res = await addCoupon(values);
          toast.success(res?.data?.message || "Coupon added!");
        }
        formik.resetForm();
        setEditingId(null);
      } catch (err) {
        toast.error("Failed to save coupon.");
      }
    },
  });

  const handleEdit = (coupon) => {
    formik.setValues({
      code: coupon.code,
      discount: coupon.discount,
      expiresAt: toLocalDateTimeInput(coupon.expiresAt),
    });
    setEditingId(coupon._id);
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteCoupon(id);
      toast.success(res?.data?.message || "Coupon deleted!");
    } catch {
      toast.error("Failed to delete coupon.");
    }
  };

  return (
    <div className="container mx-auto p-4">
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
              <BreadcrumbPage>Coupon Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Coupon Form */}
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4"
      >
        <h2 className="text-lg font-bold mb-4 text-primary text-center">
          Coupon Management
        </h2>

        <div>
          <Label htmlFor="code">Coupon Code</Label>
          <Input
            id="code"
            placeholder="e.g., NEWYEAR50"
            className="w-full"
            {...formik.getFieldProps("code")}
          />
          {formik.touched.code && formik.errors.code && (
            <p className="text-red-500 text-sm">{formik.errors.code}</p>
          )}
        </div>

        <div>
          <Label htmlFor="discount">Discount (%)</Label>
          <Input
            id="discount"
            type="number"
            placeholder="e.g., 20"
            className="w-full"
            {...formik.getFieldProps("discount")}
          />
          {formik.touched.discount && formik.errors.discount && (
            <p className="text-red-500 text-sm">{formik.errors.discount}</p>
          )}
        </div>

        <div>
          <Label htmlFor="expiresAt">Expiry Date & Time</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            className="w-full"
            {...formik.getFieldProps("expiresAt")}
          />
          {formik.touched.expiresAt && formik.errors.expiresAt && (
            <p className="text-red-500 text-sm">{formik.errors.expiresAt}</p>
          )}
        </div>

        <Button type="submit" className="w-full">
          {editingId ? "Update Coupon" : "Add Coupon"}
        </Button>
      </form>

      {/* Coupon List */}
      <div className="mt-10 max-w-4xl mx-auto px-2">
        <h3 className="text-2xl font-semibold text-center mb-4">All Coupons</h3>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <p className="text-red-500 text-center">Failed to load coupons.</p>
        ) : coupons.length === 0 ? (
          <p className="text-center text-gray-500">No coupons found.</p>
        ) : (
          <div className="space-y-4">
            {coupons.map((coupon) => {
              const isExpired = new Date(coupon.expiresAt) < new Date();

              return (
                <div
                  key={coupon._id}
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="text-lg font-semibold text-primary">
                      {coupon.code}{" "}
                      {isExpired ? (
                        <span className="text-red-500 text-sm ml-2">
                          (Expired)
                        </span>
                      ) : (
                        <span className="text-green-500 text-sm ml-2">
                          (Active)
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      Discount: <strong>{coupon.discount}%</strong>
                    </p>
                    <p className="text-sm text-gray-600">
                      Expires at:{" "}
                      <strong>
                        {new Date(coupon.expiresAt).toLocaleString()}
                      </strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <FaEdit
                      className="text-blue-600 cursor-pointer hover:scale-110 transition"
                      size={18}
                      onClick={() => {
                        handleEdit(coupon);
                        scrollTop();
                      }}
                    />
                    <Trash2
                      className="text-red-500 cursor-pointer hover:scale-110 transition"
                      size={18}
                      onClick={() => handleDelete(coupon._id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponPage;
