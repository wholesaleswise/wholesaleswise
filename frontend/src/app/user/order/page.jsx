"use client";
import React, { useEffect, useState } from "react";

import { useGetMyOrderQuery } from "@/lib/services/order";

import UserOrderCom from "@/components/user/UserOrderCom";
import Loading from "@/components/Loading";

const MyOrder = () => {
  const [data, setData] = useState([]);
  const { data: orders, isSuccess, error, isLoading } = useGetMyOrderQuery();

  useEffect(() => {
    if (orders && isSuccess) {
      setData(orders.data);
    }
  }, [orders, isSuccess]);
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <Loading />
      </div>
    );
  }
  return (
    <div className="overflow-y-scroll">
      <UserOrderCom data={data} />
    </div>
  );
};

export default MyOrder;
