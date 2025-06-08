"use client";
import React, { useEffect, useState } from "react";

import { useGetMyOrderQuery } from "@/lib/services/order";

import MyOrderCom from "@/components/admin/MyOrderCom";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const MyOrder = () => {
  const [data, setData] = useState([]);
  const router = useRouter();
  const { data: orders, isSuccess, isLoading } = useGetMyOrderQuery();

  useEffect(() => {
    if (orders && isSuccess) {
      setData(orders.data);
    }
  }, [orders, isSuccess]);
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center  ">
        <Loading />
      </div>
    );
  }
  return (
    <div className="overflow-y-scroll">
      <MyOrderCom data={data} />
    </div>
  );
};

export default MyOrder;
