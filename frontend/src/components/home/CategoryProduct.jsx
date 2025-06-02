"use client";
import React, { useEffect, useRef, useState } from "react";

import { useGetCategoryWiseProductQuery } from "@/lib/services/product";
import { Card, CardContent } from "../ui/card";
import Product from "../card/ProductCard";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";

const CategroyProduct = ({ category, heading }) => {
  const [data, setData] = useState([]);
  const scrollElement = useRef();
  const scrollRight = () => {
    scrollElement.current.scrollLeft += 300;
  };
  const scrollLeft = () => {
    scrollElement.current.scrollLeft -= 300;
  };
  const loadingList = new Array(13).fill(null);
  const {
    data: productData,
    isLoading,
    isError,
  } = useGetCategoryWiseProductQuery({ category });

  useEffect(() => {
    if (productData?.products) {
      const filteredProducts = productData.products.filter(
        (product) => product?.productTotalStockQty > 1
      );
      setData(filteredProducts);
    }
  }, [productData]);

  return (
    <div className="container mx-auto  relative ">
      {data.length > 0 && (
        <h2 className="text-lg md:text-xl p-4 pt-8 font-bold  text-black capitalize">
          {heading}
        </h2>
      )}
      <div
        className="flex items-center gap-4 md:gap-6 px-4 overflow-x-scroll scrollbar-none transition-all py-2"
        ref={scrollElement}
      >
        {data.length > 0 && (
          <>
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
          </>
        )}
        {isLoading
          ? loadingList.map((product, index) => {
              return (
                <div
                  key={index}
                  className="w-full min-w-[280px]  md:min-w-[320px] max-w-[280px] md:max-w-[320px]  bg-white rounded-sm shadow "
                >
                  <div className="bg-slate-200 h-48 p-4 min-w-[280px] md:min-w-[145px] flex justify-center items-center animate-pulse"></div>
                  <div className="p-4 grid gap-3">
                    <h2 className="font-medium text-base md:text-lg text-ellipsis line-clamp-1 text-black p-1 py-2 animate-pulse rounded-full bg-slate-200"></h2>
                    <p className="capitalize text-slate-500 p-1 animate-pulse rounded-full bg-slate-200  py-2"></p>
                    <div className="flex gap-3">
                      <p className="text-red-600 font-medium p-1 animate-pulse rounded-full bg-slate-200 w-full  py-2"></p>
                      <p className="text-slate-500 line-through p-1 animate-pulse rounded-full bg-slate-200 w-full  py-2"></p>
                    </div>
                    <button className="text-sm  text-white px-3  rounded-full bg-slate-200  py-2 animate-pulse"></button>
                  </div>
                </div>
              );
            })
          : data.map((product, index) => {
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

export default CategroyProduct;
