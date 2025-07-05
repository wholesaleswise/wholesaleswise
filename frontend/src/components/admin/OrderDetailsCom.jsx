"use client";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useUpdateOrderStatusMutation } from "@/lib/services/order";
import Loading from "../Loading";
import toast from "react-hot-toast";
import { useGetUserQuery } from "@/lib/services/auth";
import { Download } from "lucide-react";
import * as html2pdf from "html2pdf.js";
import { useGetInfoQuery } from "@/lib/services/websiteInfo";

const OrderDetailsCom = ({ order, id }) => {
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const componentRef = useRef();
  const [
    updateOrderStatus,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
    },
  ] = useUpdateOrderStatusMutation();
  const [user, setUser] = useState(null);
  const { data, isSuccess } = useGetUserQuery();
  const { data: websiteInfo, isLoading, isError, error } = useGetInfoQuery();
  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    }
  }, [data, isSuccess]);

  if (!order) {
    return (
      <div className="flex flex-col justify-center text-center min-h-[70vh]">
        <Loading />
      </div>
    );
  }

  const {
    UserDetails,
    paymentDetails,
    shippingAddress,
    productDetails,
    totalAmount,
    createdAt,
    orderStatus,
    couponDetails = {},
  } = order;
  const shippingCharge = shippingAddress.shippingCharge;
  const couponCode = couponDetails?.code;
  const couponDiscount = couponDetails?.discountAmount || 0;

  const handleStatusChange = async (id) => {
    if (id) {
      const response = await updateOrderStatus({ newStatus: newStatus, id });
      if (updateSuccess || response?.data) {
        toast.success(`${response?.data?.message}!!!`);
        setNewStatus("");
        setShowStatusModal(false);
      } else if (updateError || response.error) {
        toast.error(`${response?.error.data?.message}..`);
      }
    }
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById("order-details");
    const opt = {
      margin: 0.5,
      filename: `Bill_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };
    html2pdf.default().set(opt).from(element).save();
  };

  return (
    <>
      <div className="container mx-auto p-6 md:p-8 space-y-6 bg-white rounded-md shadow-md">
        <div className="flex justify-end gap-4 print:hidden">
          <Button
            onClick={handleDownloadPDF}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-sm rounded-md flex items-center gap-2 transition-colors duration-200"
          >
            Download
            <Download size={16} />
          </Button>
        </div>

        <div
          id="order-details"
          ref={componentRef}
          className="print:bg-white print:p-4"
        >
          <header className="flex flex-col md:flex-row md:justify-between gap-4 pb-6 border-b border-gray-200">
            <div>
              <h1 className="text-lg md:text-xl font-semibold">
                Bill No: {id}
              </h1>
              <p className="text-sm">
                Issued on {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {websiteInfo?.data?.websiteName}
              </h2>
              <p className="text-sm">{websiteInfo?.data?.address}</p>
              <p className="text-sm">{websiteInfo?.data?.email}</p>
              <p className="text-sm">{websiteInfo?.data?.supportNumber}</p>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 py-6 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold mb-3">
                Billing Information
              </h3>
              <p className="text-sm">
                <span className="font-medium">Name:</span> {UserDetails?.name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Email:</span> {UserDetails?.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone:</span>{" "}
                {UserDetails?.phoneNumber}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <p className="text-sm">
                <span className="font-medium">Shipping Address:</span>{" "}
                {shippingAddress?.addressLine1}
              </p>
              <p className="text-sm">
                <span className="font-medium">Full Address:</span>{" "}
                {shippingAddress?.city}, {shippingAddress?.state}{" "}
                {shippingAddress?.postalCode}
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Payment & Status</h2>
              <div className="text-sm font-medium">
                <p>Payment ID: {paymentDetails?.paymentId}</p>
                <p>
                  Payment Method:{" "}
                  <span
                    className={`ml-1 font-semibold ${
                      paymentDetails?.payment_method_type?.[0] === "paypal"
                        ? "text-blue-600"
                        : "text-yellow-700"
                    }`}
                  >
                    {paymentDetails?.payment_method_type?.[0]}
                  </span>
                </p>
                <p>
                  Payment Status:{" "}
                  <span
                    className={`ml-1 font-semibold ${
                      paymentDetails?.payment_status === "succeeded"
                        ? "text-green-600"
                        : "text-yellow-500"
                    }`}
                  >
                    {paymentDetails?.payment_status}
                  </span>
                </p>
                <p>
                  Order Status:{" "}
                  <span
                    className={`ml-1 font-semibold ${
                      orderStatus?.[0] === "Delivered"
                        ? "text-green-600"
                        : orderStatus?.[0] === "Shipped"
                        ? "text-blue-500"
                        : orderStatus?.[0] === "Processing"
                        ? "text-yellow-500"
                        : "text-red-500"
                    }`}
                  >
                    {orderStatus?.[0]}
                  </span>
                </p>
                {couponCode && (
                  <p>
                    Coupon Used:{" "}
                    <span className="ml-1 font-semibold text-indigo-600">
                      {couponCode}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="py-4 border-gray-200">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto rounded-md shadow-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Item</th>
                    <th className="px-4 py-3 font-semibold">Qty</th>
                    <th className="px-4 py-3 font-semibold">Price</th>
                    {productDetails.some((p) => p.productId?.discount > 0) && (
                      <th className="px-4 py-3 font-semibold">Discount</th>
                    )}
                    <th className="px-4 py-3 font-semibold">
                      Total (with discount)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {productDetails.map((item) => {
                    const {
                      productName,
                      discount,
                      productImageUrls,
                      category,
                      SKU,
                      productPrice,
                    } = item.productId;
                    const discountAmount = (productPrice * discount) / 100;
                    const discountedPrice = productPrice - discountAmount;
                    const itemTotal = discountedPrice * item.quantity;

                    return (
                      <tr key={item._id} className="border-b border-gray-200">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 min-w-60 max-w-80">
                            {productImageUrls?.[0] && (
                              <img
                                src={productImageUrls[0]}
                                alt={productName}
                                className="h-10 w-10 object-contain rounded-md"
                              />
                            )}
                            <div>
                              <h3 className="text-sm font-semibold">
                                {productName}
                              </h3>
                              <p className="text-xs">
                                Category: {category?.categoryName || category}
                              </p>
                              <p className="text-xs">SKU: {SKU}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">
                          AU$ {productPrice.toFixed(2)}
                        </td>
                        {productDetails.some(
                          (p) => p.productId.discount > 0
                        ) && (
                          <td className="px-4 py-3 text-green-600">
                            {discount > 0 ? `-${discount}%` : "-"}
                          </td>
                        )}
                        <td className="px-4 py-3 font-semibold">
                          AU$ {itemTotal.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td
                      colSpan={
                        productDetails.some((p) => p.productId.discount > 0)
                          ? 4
                          : 3
                      }
                      className="px-4 py-3 font-semibold"
                    >
                      Subtotal:
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      AU${" "}
                      {(totalAmount - shippingCharge + couponDiscount).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                  {couponDiscount > 0 && (
                    <tr>
                      <td
                        colSpan={
                          productDetails.some((p) => p.productId.discount > 0)
                            ? 4
                            : 3
                        }
                        className="px-4 py-3 font-semibold"
                      >
                        Coupon Discount:
                      </td>
                      <td className="px-4 py-3 font-semibold text-red-600">
                        -AU$ {couponDiscount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td
                      colSpan={
                        productDetails.some((p) => p.productId.discount > 0)
                          ? 4
                          : 3
                      }
                      className="px-4 py-3 font-semibold"
                    >
                      Shipping:
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      AU$ {shippingCharge.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={
                        productDetails.some((p) => p.productId.discount > 0)
                          ? 4
                          : 3
                      }
                      className="px-4 py-3 text-base font-bold"
                    >
                      Total:
                    </td>
                    <td className="px-4 py-3 text-base font-bold text-green-600">
                      AU$ {totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <footer className="py-4 text-center text-sm">
            Thank you for shopping with us!
          </footer>
        </div>

        {user && user?.roles[0] === "admin" && (
          <Button
            className="py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-md transition-colors duration-200 focus:ring-2 focus:ring-gray-700 focus:outline-none"
            onClick={() => setShowStatusModal(true)}
          >
            Update Order Status
          </Button>
        )}
      </div>

      {/* Modal for Change Status */}
      {showStatusModal && (
        <div className="fixed inset-0   flex items-center justify-center bg-gray-600 bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Update Order Status
            </h3>
            <Select
              value={newStatus}
              onValueChange={(value) => {
                setNewStatus(value);
              }}
            >
              <SelectTrigger className="w-full rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-visible:outline-none">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Order Status</SelectLabel>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                className="rounded-md"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors duration-200 disabled:opacity-50"
                disabled={updateLoading || !newStatus}
                onClick={() => handleStatusChange(id)}
              >
                Save Status
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderDetailsCom;
