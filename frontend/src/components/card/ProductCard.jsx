"use client";
import React, { useEffect, useState } from "react";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Link from "next/link";
import toast from "react-hot-toast";

import scrollTop from "../scrollTop";
import { Button } from "../ui/button";
import RatingStars from "../RatingStars";

import { useGetUserQuery } from "@/lib/services/auth";
import { useAddToCartMutation } from "@/lib/services/cart";
import { useRouter } from "next/navigation";

const Product = ({ product }) => {
  const [user, setUser] = useState(null);
  const discountAmount = (product?.productPrice * product?.discount) / 100;
  const discountedPrice = product?.productPrice - discountAmount;
  const router = useRouter();
  const { data, isSuccess } = useGetUserQuery();
  const [addToCart, status] = useAddToCartMutation();

  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    }
  }, [data, isSuccess]);

  const handleAddToCart = async (id) => {
    if (id && product) {
      if (!user?._id) {
        router.push("/account/login");
        toast.error("Please log in to add to cart.");
      } else {
        const res = await addToCart({ id, userId: user?.id });
        if (res?.data?.status === "success") {
          toast.success(res?.data?.message);
        } else if (res?.error?.data) {
          toast.error(res?.error?.data?.message);
        }
      }
    }
  };
  return (
    <div>
      <Link href={`/product/${product?.slug}`} onClick={scrollTop}>
        <div className=" relative h-24 sm:h-32 md:h-28 xl:h-40  p-2 pt-4 rounded-sm  ">
          <img
            src={product?.productImageUrls[0]}
            alt={product?.productName}
            className=" w-full mx-auto h-full object-scale-down hover:scale-110 transition-all"
          />
          {product?.discount > 0 && (
            <div className=" px-1 absolute flex text-[9px] left-[-12px]  top-0  py-1 sm:text-[12px] rounded-tl-sm rounded-br-sm bg-green-700 text-white">
              {product?.discount}% OFF
            </div>
          )}
        </div>

        <div>
          <div className="sm:text-sm font-medium text-lg sm:font-bold text-justify">
            <h5 className="text-sm font-bold text-gray-800 capitalize truncate">
              {product?.productName}
            </h5>
            <div className="block ">
              <RatingStars rating={product?.rating} />
            </div>
            <h6 className=" text-sm xl:block hidden text-primary font-bold rounded w-fit capitalize">
              {product?.category?.categoryName}
            </h6>
            {product?.productTotalStockQty === 0 ? (
              <div className=" py-1 rounded-md text-accent">Out of Stack</div>
            ) : (
              <div className="xl:block hidden text-sm font-medium">
                Available Stock: {product?.productTotalStockQty}
              </div>
            )}

            <div className="mt-1">
              {discountedPrice === product?.productPrice ? (
                <h6 className="sm:text-sm  text-xs font-bold text-gray-800 mb-4 md:mb-0">
                  AU ${product?.productPrice}
                </h6>
              ) : (
                <div className="flex flex-col md:flex-row  md:gap-2 md:items-center ">
                  <p className="sm:text-sm  text-xs  line-through text-red-600 ">
                    AU ${product?.productPrice}
                  </p>
                  <p className="sm:text-sm  text-xs  font-bold text-gray-800">
                    AU ${discountedPrice}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
      <Button
        type="button"
        onClick={() => handleAddToCart(product?._id)}
        className="text-xs sm:text-sm px-4 py-2 mt-2 w-full rounded-none  "
        disabled={status?.isLoading}
      >
        <AiOutlineShoppingCart size={18} />
        {status?.isLoading ? <span>Adding...</span> : <span>Add to cart</span>}
      </Button>
    </div>
  );
};

export default Product;
