"use client";
import React, { useState, useEffect, use } from "react";
import { useGetsingleOrderQuery } from "@/lib/services/order";
import { useRouter } from "next/navigation";
import OrderDetailsCom from "@/components/OrderDetailsCom";

const OrderDetails = ({ id }) => {
  console.log(id);
  const [order, setOrder] = useState(null);
  const { data, isSuccess, error } = useGetsingleOrderQuery(id);
  const router = useRouter();
  useEffect(() => {
    if (isSuccess) {
      setOrder(data.data);
    }
  }, [data, isSuccess]);

  return (
    <>
      <OrderDetailsCom order={order} id={id} />
    </>
  );
};

export default OrderDetails;
