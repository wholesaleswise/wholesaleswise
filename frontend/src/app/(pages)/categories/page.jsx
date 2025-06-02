"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";

import Loading from "@/components/Loading";
import { useGetAllCategoryQuery } from "@/lib/services/category";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MdSearchOff } from "react-icons/md";

const AllCategory = () => {
  const {
    data: categoryData,
    isLoading,
    isError,
    isSuccess,
    status: getCategoryStatus,
  } = useGetAllCategoryQuery();
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [categories]);

  useEffect(() => {
    if (categoryData?.categories || isSuccess) {
      setCategories(categoryData.categories);
      console.log(categoryData);
    } else if (isError) {
      toast.error(`${getCategoryStatus?.error?.data?.message}..`);
    }
  }, [categoryData]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        <Loading />
      </div>
    );
  }
  if (isError)
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        {getCategoryStatus?.error?.data?.message}
      </div>
    );

  if (categories?.length === 0)
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
        <MdSearchOff className="text-[90px]" />
        <h2 className="text-2xl md:text-4xl font-semibold text-red-800">
          Oops! No category found
        </h2>
      </div>
    );

  return (
    <div className="container mx-auto p-4  min-h-[80vh]">
      <div className="my-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Categories</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 pt-4">
        {categories?.map((category) => (
          <Link
            href={"/category/" + category?.categoryName}
            className="cursor-pointer flex flex-col items-center justify-center"
            key={category?._id}
            data-aos="zoom-in"
          >
            <div className=" w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden p-4 bg-secondary  sm:p-4  flex items-center justify-center mb-4 ">
              <img
                src={category?.categoryImage}
                alt={`Image for ${category?.categoryName}`}
                className="h-full object-contain  duration-300 hover:scale-110 transition-all "
              />
            </div>
            <p className="text-center text-sm md:text-base capitalize">
              {category?.categoryName}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AllCategory;
