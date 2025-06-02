"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetOrderBySessionQuery } from "@/lib/services/order";
import { useGetUserQuery } from "@/lib/services/auth";

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();

  const [user, setUser] = useState(null);

  const {
    data: userData,
    isSuccess: isUserSuccess,
    error: userError,
  } = useGetUserQuery();

  useEffect(() => {
    if (userData && isUserSuccess) {
      setUser(userData.user);
    }
  }, [userData, isUserSuccess]);

  const userRole = user?.roles?.[0];

  const {
    data: orderData,
    isLoading,
    isError,
    status,
  } = useGetOrderBySessionQuery(sessionId, {
    skip: !sessionId,
  });

  useEffect(() => {
    if (orderData?.success && userRole && orderData.order) {
      const orderId = orderData.order.id;

      if (userRole === "admin") {
        router.push("/admin/my-order");
      } else {
        router.push("/user/order");
      }
    }
  }, [orderData, userRole, router]);

  const isErrorState = isError || !orderData?.success || userError;

  return (
    <div className="min-h-screen flex items-center justify-center  px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center space-y-6">
        {isLoading || status === "pending" ? (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto"></div>
            <h2 className="text-lg font-semibold text-gray-700">
              Confirming your order...
            </h2>
            <p className="text-gray-500">
              Please wait while we confirm your purchase.
            </p>
          </>
        ) : isErrorState ? (
          <>
            <h2 className="text-xl font-semibold text-red-600">
              ❌ Order Failed
            </h2>
            <p className="text-gray-600">
              There was a problem confirming your order. Please contact support.
            </p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-green-600">
              ✅ Order Confirmed!
            </h2>
            <p className="text-gray-700">
              Redirecting to your order details...
            </p>
          </>
        )}
      </div>
    </div>
  );
}
