"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { MdSearchOff } from "react-icons/md";
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
import { useGetProductsByDiscountQuery } from "@/lib/services/product";

const DiscountProductsPage = () => {
  const searchParams = useSearchParams();
  const discount = Number(searchParams.get("discount") || 0);

  const { data, isLoading } = useGetProductsByDiscountQuery(discount);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    if (data?.products) {
      const valid = data.products.filter((p) => p.productTotalStockQty > 1);
      setFilteredProducts(valid);
    }
  }, [data]);

  return (
    <div className="container mx-auto p-4 relative min-h-[80vh]">
      {/* Breadcrumb */}
      <div className="pt-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Discount Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Discount Message */}
      <div className="mt-4">
        {discount > 0 ? (
          <p className="text-green-700 text-base font-semibold">
            Showing products with {discount}% discount
          </p>
        ) : (
          <p className="text-gray-500 text-lg">No discount filter applied</p>
        )}
      </div>

      {/* Loading, Empty, or Product Grid */}
      {isLoading ? (
        <Loading />
      ) : filteredProducts.length === 0 ? (
        <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
          <MdSearchOff className="text-[90px] sm:text-[100px] md:text-[120px]" />
          <h2 className="text-2xl md:text-4xl font-semibold text-red-800">
            Oops! No products found
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6 max-w-md">
            We couldn't find any products matching this discount.
          </p>
        </div>
      ) : (
        <div className="grid mt-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center gap-4">
          {filteredProducts.map((product) => (
            <Card
              key={product._id}
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

export default DiscountProductsPage;
