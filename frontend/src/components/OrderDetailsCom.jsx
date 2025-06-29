"use client";
import React, { useRef } from "react";
import { Download } from "lucide-react";
import * as html2pdf from "html2pdf.js";
import Loading from "./Loading";
import { Button } from "./ui/button";
import { useGetInfoQuery } from "@/lib/services/websiteInfo";

const OrderDetailsCom = ({ order, id }) => {
  const componentRef = useRef();
  const { data: websiteInfo } = useGetInfoQuery();

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

  const handleDownloadPDF = async () => {
    const element = document.getElementById("order-details");
    const opt = {
      margin: 0.5,
      filename: `Bill_${id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        scrollY: 0,
        scrollX: 0,
        onclone: (doc) => {
          doc.querySelectorAll("img").forEach((img) => {
            img.crossOrigin = "anonymous";
            img.style.display = "block";
          });
        },
      },
      jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
    };

    await html2pdf().set(opt).from(element).save();
  };

  return (
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
            <h1 className="text-lg md:text-xl font-semibold">Bill No: {id}</h1>
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
            <h3 className="text-lg font-semibold mb-3">Billing Information</h3>
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
                  <th className="px-4 py-3 font-semibold">Total  (with discount)</th>
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
                      {productDetails.some((p) => p.productId.discount > 0) && (
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
                    {(totalAmount - shippingCharge + couponDiscount).toFixed(2)}
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
    </div>
  );
};

export default OrderDetailsCom;
