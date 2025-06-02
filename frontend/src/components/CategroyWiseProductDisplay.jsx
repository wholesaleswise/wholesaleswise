"use client";
import React, { useEffect, useState } from "react";

import { useGetCategoryWiseProductQuery } from "@/lib/services/product";
import { Card, CardContent } from "./ui/card";
import Product from "./card/ProductCard";

const CategroyWiseProductDisplay = ({ category, heading }) => {
  const {
    data: productData,
    isLoading,
    isError,
  } = useGetCategoryWiseProductQuery({ category });
  const [data, setData] = useState([]);
  const loadingList = new Array(13).fill(null);

  useEffect(() => {
    if (productData?.products) {
      setData(productData.products);
    }
  }, [productData]);

  return (
    <div className="container mx-auto  my-4 relative">
      {data.length > 0 && (
        <div className="flex items-center pb-4 justify-center gap-10">
          <h2 className="text-lg md:text-2xl  font-bold  text-black capitalize">
            {heading}
          </h2>
        </div>
      )}

      <div className="flex justify-center gap-6 overflow-x-scroll scrollbar-none transition-all">
        {isLoading ? (
          loadingList.map((product, index) => {
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
        ) : data.length === 0 ? (
          <div className="w-full text-center py-10 text-lg text-slate-500">
            No products found.
          </div>
        ) : (
          data.map((product, index) => {
            return (
              <Card
                key={product?._id}
                className="w-full min-w-[200px]  md:min-w-[250px] max-w-[230px] md:max-w-[280px]  bg-white shadow"
              >
                <CardContent>
                  <Product product={product} />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CategroyWiseProductDisplay;
