"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useGetAllCategoryQuery } from "@/lib/services/category";
import CategoryCard from "../card/CategoryCard";
import toast from "react-hot-toast";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const categoryLoading = useMemo(() => new Array(13).fill(null), []);

  const {
    data: categoryData,
    isLoading,
    isError,
    isSuccess,
    status: getCategoryStatus,
  } = useGetAllCategoryQuery();

  useEffect(() => {
    if (isSuccess && categoryData?.categories) {
      const filteredCategories = categoryData?.categories.filter(
        (category) =>
          Array.isArray(category.products) && category?.products?.length > 0
      );
      setCategories(filteredCategories);
      console.log("filteredCategories", filteredCategories);
    } else if (isError) {
      toast.error(`${getCategoryStatus?.error?.data?.message}..`);
    }
  }, [categoryData, isSuccess, isError, getCategoryStatus]);

  if (isError) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-red-500">
        {getCategoryStatus?.error?.data?.message || "An error occurred"}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pt-4">
      <div className="overflow-scroll scrollbar-none">
        {isLoading ? (
          <div className="flex -mx-2 mt-4 sm:mt-8">
            {categoryLoading.map((_, index) => (
              <div key={index} className="px-2">
                <div className="h-16 w-16 md:w-20 md:h-20 rounded-full bg-red-200 animate-pulse"></div>
                <p className="h-5 w-16 md:w-20 md:h-7 mt-5 rounded-md bg-red-200 animate-pulse"></p>
              </div>
            ))}
          </div>
        ) : categories?.length !== 0 ? (
          <div className="flex gap-2 mt-4 ">
            {categories.map((category) => (
              <Link
                href={`/category/${category.categoryName}`}
                key={category._id}
              >
                <div className="px-2">
                  <CategoryCard category={category} />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="min-h-20 py-4 text-center text-red-500">
            Category data not found!
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
