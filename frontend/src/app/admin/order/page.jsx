"use client";
import React, { useEffect, useState } from "react";
import OrderCom from "@/components/admin/AllOrderCom";
import { useGetAllOrderQuery } from "@/lib/services/order";
import { useRouter } from "next/navigation";
import Loading from "@/components/Loading";

const AllOrder = () => {
  const [data, setData] = useState([]);
  const { data: orders, isSuccess, error, isLoading } = useGetAllOrderQuery();

  useEffect(() => {
    if (orders && isSuccess) {
      setData(orders.data);
    }
  }, [orders, isSuccess, data]);
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <Loading />
      </div>
    );
  }
  return <OrderCom data={data} />;
};

export default AllOrder;
