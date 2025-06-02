"use client";
import React, { use, useEffect, useState } from "react";

import { useGetCategoryWiseProductQuery } from "@/lib/services/product";

import Loading from "@/components/Loading";
import Product from "@/components/card/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { MdSearchOff } from "react-icons/md";

const Category = ({ category }) => {
  const { data: productData, isLoading } = useGetCategoryWiseProductQuery({
    category,
  });
  const [data, setData] = useState([]);
  const loadingList = new Array(13).fill(null);

  useEffect(() => {
    if (productData?.products) {
      const filteredProducts = productData?.products.filter(
        (product) => product?.productTotalStockQty > 1
      );
      setData(filteredProducts);
    }
  }, [productData]);

  return (
    <div className="container mx-auto  p-4 relative min-h-[80vh]">
      <div className="pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/categories">Categories</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{category}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {isLoading ? (
        <Loading />
      ) : data.length === 0 ? (
        <div
          className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn"
          aria-label="No results found"
        >
          <MdSearchOff className="text-[90px] sm:text-[100px] md:text-[120px]" />
          <h2
            className="text-2xl md:text-4xl font-semibold text-red-800"
            aria-label="Oops! No results found"
          >
            Oops! No results found
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6 max-w-md">
            We couldn't find any matches for this category.
          </p>
        </div>
      ) : (
        <div className="grid mt-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center gap-4">
          {data.map((product, index) => (
            <Card
              key={product?._id}
              className="w-full hover:drop-shadow-lg transition-all ease-in-out bg-white shadow"
            >
              <CardContent>
                <Product product={product} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Category;
