"use client";
import AOS from "aos";
import "aos/dist/aos.css";
import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
import { useGetAllOrderQuery } from "@/lib/services/order";
import { useGetAllCategoryQuery } from "@/lib/services/category";
import { useGetAllProductQuery } from "@/lib/services/product";
import Link from "next/link";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale
);

const Admindashboard = () => {
  const { data: orders, error, isLoading, isError } = useGetAllOrderQuery();
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [todaySales, setTodaySales] = useState(0);
  const { data: categoryData } = useGetAllCategoryQuery();
  const { data: productData } = useGetAllProductQuery();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    if (orders?.data && orders?.data.length > 0) {
      // Calculate total orders and sales
      const orderCount = orders.data.length;
      const salesSum = orders.data.reduce((acc, order) => {
        const finalPrice = parseFloat(order.totalAmount);
        return acc + finalPrice;
      }, 0);

      setTotalOrders(orderCount);
      setTotalSales(salesSum);

      // Calculate today's sales
      const today = new Date().toISOString().split("T")[0]; // Get today's date in "YYYY-MM-DD" format
      const todayOrders = orders.data.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === today;
      });

      const todaySalesSum = todayOrders.reduce((acc, order) => {
        return acc + parseFloat(order.totalAmount);
      }, 0);

      setTodaySales(todaySalesSum);
    }
  }, [orders]);

  // Aggregate sales by date
  const aggregatedData = orders?.data?.reduce((acc, order) => {
    if (!order.createdAt) return acc;
    const date = new Date(order.createdAt);
    const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

    if (!acc[formattedDate]) {
      acc[formattedDate] = { totalSales: 0, orderCount: 0 };
    }

    acc[formattedDate].totalSales += parseFloat(order.totalAmount) || 0; // Adjust to match field used
    acc[formattedDate].orderCount += 1;

    return acc;
  }, {});

  const labels = Object.keys(aggregatedData || {});
  const salesData = labels.map((date) => aggregatedData[date].totalSales);

  const lineChartData = {
    labels: labels,
    datasets: [
      {
        label: "Total Sales",
        data: salesData,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="min-h-[80vh] flex justify-center items-center text-red-500 "
        data-aos="fade-up"
      >
        {error?.data?.message}
      </div>
    );
  }

  return (
    <div className="p-4 overflow-y-auto">
      <div className="py-4 md:pl-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Admin Dashboard</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex flex-col items-center justify-center gap-3 mb-6">
        <div
          className="flex flex-col lg:flex-row p-5 gap-4 w-full justify-between"
          data-aos="fade-up"
        >
          <Link
            href=""
            className="border p-4 bg-[#eff0f5] w-full rounded-lg shadow-md flex flex-col items-center justify-center space-x-2 h-40"
          >
            <p>Total Sales</p>
            <h2 className="text-2xl font-semibold">
              AU$ {totalSales.toFixed(2)}
            </h2>
          </Link>
          <Link
            href=""
            className="border p-4 bg-[#eff0f5] w-full rounded-lg shadow-md flex flex-col items-center justify-center space-x-2 h-40"
          >
            <p>Total Sales Today</p>
            <h2 className="text-2xl font-semibold">
              AU$ {todaySales.toFixed(2)} {/* Display Today's sales */}
            </h2>
          </Link>
          <Link
            href=""
            className="border p-4 bg-[#eff0f5] w-full rounded-lg shadow-md flex flex-col items-center justify-center space-x-2 h-40"
          >
            <p>Total Products</p>
            <h2 className="text-2xl font-semibold">
              {productData?.products?.length}
            </h2>
          </Link>
          <Link
            href=""
            className="border p-4 bg-[#eff0f5] w-full rounded-lg shadow-md flex flex-col items-center justify-center space-x-2 h-40"
          >
            <p>Total Category</p>
            <h2 className="text-2xl font-semibold">
              {categoryData?.categories?.length}
            </h2>
          </Link>
        </div>
      </div>
      <div className="mb-10">
        <div className="h-80 p-5">
          <h2 className="text-lg font-semibold mb-2">Orders Over Time</h2>
          <Line
            data={lineChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "top",
                },
              },
              scales: {
                x: {
                  type: "category",
                  beginAtZero: true,
                },
                y: { beginAtZero: true },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Admindashboard;
