"use client";
import Product from "@/components/card/ProductCard";
import { useGetAllProductQuery } from "@/lib/services/product";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { IoArrowForwardSharp } from "react-icons/io5";

import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { Card, CardContent } from "../ui/card";

const ProductData = () => {
  const [products, setProducts] = useState([]);
  const {
    data: productData,
    isLoading,
    isError,
    status,
  } = useGetAllProductQuery();
  const loadingList = new Array(13).fill(null);
  const scrollElement = useRef();
  const scrollRight = () => {
    scrollElement.current.scrollLeft += 300;
  };
  const scrollLeft = () => {
    scrollElement.current.scrollLeft -= 300;
  };
  useEffect(() => {
    if (productData?.products) {
      const filteredProducts = productData.products.filter(
        (product) => product.productTotalStockQty > 1
      );
      setProducts(filteredProducts);
    }
  }, [productData]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 mt-8 relative flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-al">
        {loadingList.map((product, index) => (
          <div
            key={index}
            className=" px-4 mt-8 relative w-full min-w-[200px]  md:min-w-[250px] max-w-[200px] md:max-w-[250px] bg-white rounded-sm shadow"
          >
            <div className="bg-slate-200 h-40 p-4 min-w-[180px] md:min-w-[235px] flex justify-center items-center animate-pulse"></div>
            <div className="p-4 grid gap-3">
              <h2 className="font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black p-1 py-2 animate-pulse rounded-full bg-slate-200"></h2>
              <p className="capitalize text-slate-500 p-1 animate-pulse rounded-full bg-slate-200 py-2"></p>
              <div className="flex gap-3">
                <p className="text-red-600 font-medium p-1 animate-pulse rounded-full bg-slate-200 w-full py-2"></p>
                <p className="text-slate-500 line-through p-1 animate-pulse rounded-full bg-slate-200 w-full py-2"></p>
              </div>
              <button className="text-sm text-white px-3 rounded-full bg-slate-200 py-2 animate-pulse"></button>
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (products?.length === 0)
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-red-500 ">
        product data not found!
      </div>
    );

  if (isError)
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-red-500">
        {status?.error?.data?.message}
      </div>
    );
  return (
    <div className="container mx-auto px-4 mt-8 relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-black">
          All Products
        </h2>
        <Link
          href="/products"
          className="flex gap-1 text-primary hover:underline items-center justify-center"
        >
          <span className="text-sm md:text-base">ALL PRODUCTS</span>
          <IoArrowForwardSharp />
        </Link>
      </div>

      <div
        className="flex items-center gap-4 md:gap-6 overflow-x-scroll scrollbar-none transition-all py-2"
        ref={scrollElement}
      >
        <button
          className="bg-white shadow-md rounded-full p-1 absolute left-0 text-lg block"
          onClick={scrollLeft}
        >
          <FaAngleLeft />
        </button>
        <button
          className="bg-white shadow-md rounded-full p-1 absolute right-0 text-lg block"
          onClick={scrollRight}
        >
          <FaAngleRight />
        </button>

        {products?.map((product, index) => {
          return (
            <Card
              key={product?._id}
              className="w-full min-w-[150px] sm:min-w-[200px]  md:min-w-[250px] max-w-[150px] sm:max-w-[200px] md:max-w-[250px]  bg-white "
            >
              <CardContent>
                <Product product={product} />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductData;
