"use client";
import React, { useState, useEffect, use } from "react";
import { useGetsingleOrderQuery } from "@/lib/services/order";
import OrderDetailsCom from "@/components/OrderDetailsCom";

const OrderDetails = ({ params }) => {
  const { id } = use(params);
  const [order, setOrder] = useState(null);
  const { data, isSuccess } = useGetsingleOrderQuery(id);

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
