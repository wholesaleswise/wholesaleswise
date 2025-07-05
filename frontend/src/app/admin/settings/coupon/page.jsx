// "use client";

// import React, { useState } from "react";
// import { useFormik } from "formik";
// import * as Yup from "yup";
// import toast from "react-hot-toast";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { FaEdit } from "react-icons/fa";
// import { Trash2 } from "lucide-react";
// import Loading from "@/components/Loading";
// import {
//   useAddCouponMutation,
//   useDeleteCouponMutation,
//   useGetAllCouponsQuery,
//   useUpdateCouponMutation,
// } from "@/lib/services/coupon";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import scrollTop from "@/components/scrollTop";
// import Link from "next/link";
// import { couponSchema } from "@/validation/schemas";

// // Converts UTC time to local datetime-local input value
// const toLocalDateTimeInput = (utcDate) => {
//   if (!utcDate) return "";
//   const date = new Date(utcDate);
//   const timezoneOffset = date.getTimezoneOffset();
//   const localDate = new Date(date.getTime() - timezoneOffset * 60000);
//   return localDate.toISOString().slice(0, 16); // YYYY-MM-DDTHH:MM
// };

// const CouponPage = () => {
//   const [editingId, setEditingId] = useState(null);

//   const { data: coupons = [], isLoading, error } = useGetAllCouponsQuery();
//   const [addCoupon] = useAddCouponMutation();
//   const [updateCoupon] = useUpdateCouponMutation();
//   const [deleteCoupon] = useDeleteCouponMutation();

//   const formik = useFormik({
//     initialValues: {
//       code: "",
//       discount: "",
//       startDate: "",
//       expiresAt: "",
//       maxUses: "",
//       maxUsesPerUser: "1",
//       active: true,
//     },
//     validationSchema: couponSchema,
//     onSubmit: async (values) => {
//       try {
//         const preparedValues = {
//           ...values,
//           discount: Number(values.discount),
//           maxUses:
//             values.maxUses === "" || values.maxUses === null
//               ? null
//               : Number(values.maxUses),
//           maxUsesPerUser: Number(values.maxUsesPerUser),
//           startDate: new Date(values.startDate),
//           expiresAt: new Date(values.expiresAt),
//         };

//         if (editingId) {
//           const res = await updateCoupon({
//             id: editingId,
//             data: preparedValues,
//           });
//           toast.success(res?.data?.message || "Coupon updated!");
//         } else {
//           const res = await addCoupon(preparedValues);
//           toast.success(res?.data?.message || "Coupon added!");
//         }
//         formik.resetForm();
//         setEditingId(null);
//       } catch (err) {
//         toast.error("Failed to save coupon.");
//       }
//     },
//   });

//   const handleEdit = (coupon) => {
//     formik.setValues({
//       code: coupon.code,
//       discount: String(coupon.discount),
//       startDate: toLocalDateTimeInput(coupon.startDate),
//       expiresAt: toLocalDateTimeInput(coupon.expiresAt),
//       maxUses: coupon.maxUses === null ? "" : String(coupon.maxUses),
//       maxUsesPerUser: String(coupon.maxUsesPerUser),
//       active: coupon.active,
//     });
//     setEditingId(coupon._id);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const res = await deleteCoupon(id);
//       toast.success(res?.data?.message || "Coupon deleted!");
//     } catch {
//       toast.error("Failed to delete coupon.");
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <div className="py-6">
//         <Breadcrumb>
//           <BreadcrumbList>
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/">Home</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink asChild>
//                 <Link href="/admin/dashboard">Admin Dashboard</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbPage>Coupon Management</BreadcrumbPage>
//             </BreadcrumbItem>
//           </BreadcrumbList>
//         </Breadcrumb>
//       </div>

//       {/* Coupon Form */}
//       <form
//         onSubmit={formik.handleSubmit}
//         className="bg-white border border-gray-200 p-4 sm:p-6 rounded-lg shadow-md w-full max-w-md mx-auto space-y-4"
//       >
//         <h2 className="text-lg font-bold mb-4 text-primary text-center">
//           Coupon Management
//         </h2>

//         <div>
//           <Label htmlFor="code" className="font-semibold mb-2 flex gap-2">
//             Coupon Code <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             id="code"
//             placeholder="e.g., NEWYEAR50"
//             className="w-full"
//             {...formik.getFieldProps("code")}
//           />
//           {formik.touched.code && formik.errors.code && (
//             <p className="text-red-500 text-sm">{formik.errors.code}</p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="discount" className="font-semibold mb-2 flex gap-2">
//             Discount (%) <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             id="discount"
//             type="text" // changed to text
//             placeholder="e.g., 20"
//             className="w-full"
//             {...formik.getFieldProps("discount")}
//           />
//           {formik.touched.discount && formik.errors.discount && (
//             <p className="text-red-500 text-sm">{formik.errors.discount}</p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="startDate" className="font-semibold mb-2 flex gap-2">
//             Start Date &amp; Time <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             id="startDate"
//             type="datetime-local"
//             className="w-full"
//             {...formik.getFieldProps("startDate")}
//           />
//           {formik.touched.startDate && formik.errors.startDate && (
//             <p className="text-red-500 text-sm">{formik.errors.startDate}</p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="expiresAt" className="font-semibold mb-2 flex gap-2">
//             Expiry Date &amp; Time <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             id="expiresAt"
//             type="datetime-local"
//             className="w-full"
//             {...formik.getFieldProps("expiresAt")}
//           />
//           {formik.touched.expiresAt && formik.errors.expiresAt && (
//             <p className="text-red-500 text-sm">{formik.errors.expiresAt}</p>
//           )}
//         </div>

//         <div>
//           <Label htmlFor="maxUses" className="font-semibold mb-2 flex gap-2">
//             Max Uses (Global)
//           </Label>
//           <Input
//             id="maxUses"
//             type="text" // changed to text
//             placeholder="Leave empty for unlimited"
//             className="w-full"
//             {...formik.getFieldProps("maxUses")}
//           />
//           {formik.touched.maxUses && formik.errors.maxUses && (
//             <p className="text-red-500 text-sm">{formik.errors.maxUses}</p>
//           )}
//         </div>

//         <div>
//           <Label
//             htmlFor="maxUsesPerUser"
//             className="font-semibold mb-2 flex gap-2"
//           >
//             Max Uses Per User <span className="text-red-500">*</span>
//           </Label>
//           <Input
//             id="maxUsesPerUser"
//             type="text" // changed to text
//             className="w-full"
//             {...formik.getFieldProps("maxUsesPerUser")}
//           />
//           {formik.touched.maxUsesPerUser && formik.errors.maxUsesPerUser && (
//             <p className="text-red-500 text-sm">
//               {formik.errors.maxUsesPerUser}
//             </p>
//           )}
//         </div>

//         <div className="flex items-center gap-2">
//           <input
//             id="active"
//             type="checkbox"
//             className="cursor-pointer"
//             {...formik.getFieldProps("active")}
//             checked={formik.values.active}
//           />
//           <Label htmlFor="active" className="cursor-pointer select-none">
//             Active
//           </Label>
//         </div>

//         <Button type="submit" className="w-full">
//           {editingId ? "Update Coupon" : "Add Coupon"}
//         </Button>
//       </form>

//       {/* Coupon List */}
//       <div className="mt-10 max-w-xl mx-auto px-2">
//         <h3 className="text-xl font-semibold text-center mb-4">All Coupons</h3>

//         {isLoading ? (
//           <Loading />
//         ) : error ? (
//           <p className="text-red-500 text-center">Failed to load coupons.</p>
//         ) : coupons.length === 0 ? (
//           <p className="text-center text-gray-500">No coupons found.</p>
//         ) : (
//           <div className="space-y-4">
//             {coupons.map((coupon) => {
//               const now = new Date();
//               const startDate = new Date(coupon.startDate);
//               const expiresAt = new Date(coupon.expiresAt);

//               const totalUses =
//                 coupon.usedBy?.reduce((sum, u) => sum + u.timesUsed, 0) || 0;

//               const isExpired = now > expiresAt;
//               const notStarted = now < startDate;
//               const inactive = !coupon.active;
//               const usageLimitReached =
//                 coupon.maxUses !== null && totalUses >= coupon.maxUses;

//               let statusLabel = "";
//               let statusColor = "";

//               if (inactive) {
//                 statusLabel = "Inactive";
//                 statusColor = "text-gray-500";
//               } else if (notStarted) {
//                 statusLabel = "Not Started";
//                 statusColor = "text-yellow-500";
//               } else if (isExpired) {
//                 statusLabel = "Expired";
//                 statusColor = "text-red-500";
//               } else if (usageLimitReached) {
//                 statusLabel = "Usage Limit Reached";
//                 statusColor = "text-red-600";
//               } else {
//                 statusLabel = "Active";
//                 statusColor = "text-green-500";
//               }

//               return (
//                 <div
//                   key={coupon._id}
//                   className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border rounded-md p-4 bg-white shadow-sm hover:shadow-md transition"
//                 >
//                   <div>
//                     <p className="text-lg font-semibold text-primary">
//                       {coupon.code}{" "}
//                       <span className={`${statusColor} text-sm ml-2`}>
//                         ({statusLabel})
//                       </span>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Discount: <strong>{coupon.discount}%</strong>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Start Date: <strong>{startDate.toLocaleString()}</strong>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Expires at: <strong>{expiresAt.toLocaleString()}</strong>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Max Uses (Global):{" "}
//                       <strong>
//                         {coupon.maxUses === null ? "Unlimited" : coupon.maxUses}
//                       </strong>
//                     </p>
//                     <p className="text-sm text-gray-600">
//                       Max Uses Per User:{" "}
//                       <strong>{coupon.maxUsesPerUser}</strong>
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-4">
//                     <FaEdit
//                       className="text-blue-600 cursor-pointer hover:scale-110 transition"
//                       size={18}
//                       onClick={() => {
//                         handleEdit(coupon);
//                         scrollTop();
//                       }}
//                     />
//                     <Trash2
//                       className="text-red-500 cursor-pointer hover:scale-110 transition"
//                       size={18}
//                       onClick={() => handleDelete(coupon._id)}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CouponPage;

"use client";

import React, { useState } from "react";
import { useFormik } from "formik";
import toast from "react-hot-toast";
import { couponSchema } from "@/validation/schemas";
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

const toLocalDateTimeInput = (utcDate) => {
  if (!utcDate) return "";
  const date = new Date(utcDate);
  const timezoneOffset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - timezoneOffset * 60000);
  return localDate.toISOString().slice(0, 16);
};

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
      startDate: "",
      expiresAt: "",
      maxUses: "",
      maxUsesPerUser: "1",
      active: false,
    },
    validationSchema: couponSchema,
    onSubmit: async (values) => {
      try {
        const preparedValues = {
          ...values,
          discount: Number(values.discount),
          maxUses:
            values.maxUses === "" || values.maxUses === null
              ? null
              : Number(values.maxUses),
          maxUsesPerUser: Number(values.maxUsesPerUser),
          startDate: new Date(values.startDate),
          expiresAt: new Date(values.expiresAt),
        };

        const res = editingId
          ? await updateCoupon({ id: editingId, data: preparedValues })
          : await addCoupon(preparedValues);

        toast.success(
          res?.data?.message ||
            (editingId ? "Coupon updated!" : "Coupon added!")
        );
        formik.resetForm();
        setEditingId(null);
      } catch {
        toast.error("Failed to save coupon.");
      }
    },
  });

  const handleEdit = (coupon) => {
    formik.setValues({
      code: coupon.code,
      discount: String(coupon.discount),
      startDate: toLocalDateTimeInput(coupon.startDate),
      expiresAt: toLocalDateTimeInput(coupon.expiresAt),
      maxUses: coupon.maxUses === null ? "" : String(coupon.maxUses),
      maxUsesPerUser: String(coupon.maxUsesPerUser),
      active: coupon.active,
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
              <BreadcrumbPage>Coupon Management</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Coupon Form */}
      <form
        onSubmit={formik.handleSubmit}
        className="bg-white border border-gray-200 p-6 rounded-lg shadow-md w-full max-w-xl mx-auto space-y-5"
      >
        <h2 className="text-lg font-bold mb-4 text-primary text-center">
          {editingId ? "Edit Coupon" : "Create New Coupon"}
        </h2>

        {/* Fields */}
        {[
          { id: "code", label: "Coupon Code", required: true },
          { id: "discount", label: "Discount (%)", required: true },
          {
            id: "startDate",
            label: "Start Date & Time",
            type: "datetime-local",
            required: true,
          },
          {
            id: "expiresAt",
            label: "Expiry Date & Time",
            type: "datetime-local",
            required: true,
          },
          {
            id: "maxUses",
            label: "Max Uses (Global)",
            placeholder: "Leave empty for unlimited",
          },
          { id: "maxUsesPerUser", label: "Max Uses Per User", required: true },
        ].map(({ id, label, required, type = "text", placeholder }) => (
          <div key={id}>
            <Label htmlFor={id} className="font-medium flex gap-1 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              {...formik.getFieldProps(id)}
            />
            {formik.touched[id] && formik.errors[id] && (
              <p className="text-sm text-red-500">{formik.errors[id]}</p>
            )}
          </div>
        ))}

        {/* Active Checkbox */}
        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={formik.values.active}
            onChange={(e) => formik.setFieldValue("active", e.target.checked)}
          />
          <Label htmlFor="active" className="cursor-pointer">
            Active ({formik.values.active ? "True" : "False"})
          </Label>
        </div>

        <Button type="submit" className="w-full">
          {editingId ? "Update Coupon" : "Add Coupon"}
        </Button>
      </form>

      {/* Coupon List */}
      <div className="mt-10 max-w-xl mx-auto px-2">
        <h3 className="text-2xl font-semibold text-center mb-6">All Coupons</h3>

        {isLoading ? (
          <Loading />
        ) : error ? (
          <p className="text-center text-red-500">Failed to load coupons.</p>
        ) : coupons.length === 0 ? (
          <p className="text-center text-gray-500">No coupons found.</p>
        ) : (
          <div className="grid gap-6">
            {coupons.map((coupon) => {
              const now = new Date();
              const start = new Date(coupon.startDate);
              const end = new Date(coupon.expiresAt);
              const totalUses =
                coupon.usedBy?.reduce((sum, u) => sum + u.timesUsed, 0) || 0;

              const isExpired = now > end;
              const notStarted = now < start;
              const inactive = !coupon.active;
              const usageLimitReached =
                coupon.maxUses !== null && totalUses >= coupon.maxUses;

              let statusLabel = "";
              let statusColor = "";

              if (inactive) {
                statusLabel = "Inactive";
                statusColor = "bg-gray-500";
              } else if (notStarted) {
                statusLabel = "Not Started";
                statusColor = "bg-yellow-500";
              } else if (isExpired) {
                statusLabel = "Expired";
                statusColor = "bg-red-500";
              } else if (usageLimitReached) {
                statusLabel = "Limit Reached";
                statusColor = "bg-orange-500";
              } else {
                statusLabel = "Active";
                statusColor = "bg-green-500";
              }

              return (
                <div
                  key={coupon._id}
                  className="border border-gray-200 rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-semibold text-primary">
                          {coupon.code}
                        </p>
                        <span
                          className={`text-xs text-white px-2 py-0.5 rounded-full ${statusColor}`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Discount: <strong>{coupon.discount}%</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Start: <strong>{start.toLocaleString()}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Expiry: <strong>{end.toLocaleString()}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Max Uses:{" "}
                        <strong>
                          {coupon.maxUses === null
                            ? "Unlimited"
                            : coupon.maxUses}
                        </strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Max Uses/User: <strong>{coupon.maxUsesPerUser}</strong>
                      </p>
                      <p className="text-sm text-gray-600">
                        Active:{" "}
                        <strong>{coupon.active ? "True" : "False"}</strong>
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
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
