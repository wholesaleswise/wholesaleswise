"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  useFetchCartQuery,
  useDeleteCartItemMutation,
  useUpdateCartItemMutation,
  useDeleteAllCartItemMutation,
} from "@/lib/services/cart";
import { useGetUserQuery } from "@/lib/services/auth";
import Loading from "@/components/Loading";
import { MdSearchOff } from "react-icons/md";

const CartItem = ({
  item,
  onRemove,
  onUpdateQuantity,
  deleteStatus,
  updateStatus,
}) => {
  const { productId, quantity } = item;
  const {
    productPrice,
    discount,
    productImageUrls,
    productName,
    productTotalStockQty,
  } = productId;

  const discountAmount = (productPrice * discount) / 100;
  const discountedPrice = productPrice - discountAmount;

  return (
    <div className="items-start ">
      <div className="w-24 h-24  max-sm:w-24 max-sm:h-24 shrink-0 bg-gray-100 p-2 rounded-md">
        <img
          src={productImageUrls[0]}
          alt={productName}
          className="w-full h-full object-contain"
        />
      </div>

      <div className="flex flex-col">
        <h4 className="text-base font-bold capitalize pt-1 text-gray-800">
          {productName}
        </h4>
        <p className="text-sm text-primary font-semibold  w-fit ">
          Stack Quantity : {productTotalStockQty}
        </p>
        {discountedPrice === productPrice ? (
          <h6 className="text-sm  font-bold text-gray-800">
            AU$ {productPrice}
          </h6>
        ) : (
          <div className="flex gap-2 items-center">
            <h6 className="text-sm text-gray-500 line-through">
              AU$ {productPrice}
            </h6>
            <h6 className="text-sm font-bold text-gray-800">
              AU$ {discountedPrice}
            </h6>
          </div>
        )}

        <div className=" flex mt-2 items-center  gap-2 space-x-2">
          <button
            type="button"
            className="px-3 py-1.5 border border-gray-300 text-gray-800 text-xs outline-none bg-transparent rounded-md"
            onClick={() => onUpdateQuantity(productId._id, quantity - 1)}
            disabled={updateStatus}
          >
            <Minus size={12} />
          </button>
          <span className="font-bold">{quantity}</span>
          <button
            type="button"
            className="px-3 py-1.5 border border-gray-300 text-gray-800 text-xs outline-none bg-transparent rounded-md"
            onClick={() => onUpdateQuantity(productId._id, quantity + 1)}
            disabled={updateStatus}
          >
            <Plus size={12} />
          </button>

          <Button
            type="button"
            className=" bg-red-700 hover:bg-red-800 px-2 py-0"
            onClick={() => onRemove(productId?._id)}
            disabled={deleteStatus}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

const Cart = () => {
  const [deleteCartItem, { isLoading: deleteStatus }] =
    useDeleteCartItemMutation();

  const [deleteCartAllItem, { isLoading: AllDeleteStatus }] =
    useDeleteAllCartItemMutation();
  const [updateCartItem, { isLoading: updateStatus, isSuccess: updateSuccss }] =
    useUpdateCartItemMutation();
  const {
    data: cartItems,
    error,
    isLoading: cartLoading,
  } = useFetchCartQuery();
  const [user, setUser] = useState(null);

  const { data, isSuccess } = useGetUserQuery();
  useEffect(() => {
    if (data && isSuccess) {
      setUser(data?.user);
    }
  }, [data, isSuccess]);

  const handleRemoveItem = async (id) => {
    const response = await deleteCartItem({ productId: id });
    console.log(response);
    if (response.data) {
      toast.success(`${response?.data?.message}`);
    } else {
      toast.error(`${response?.error?.data?.message}`);
    }
  };

  const handleRemoveAllItem = async () => {
    const response = await deleteCartAllItem();
    console.log(response);
    if (response.data) {
      toast.success(`${response?.data?.message}`);
    } else {
      toast.error(`${response?.error?.data?.message}`);
    }
  };

  const handleUpdateQuantity = async (id, quantity) => {
    if (quantity > 0) {
      const response = await updateCartItem({ productId: id, quantity });
      console.log(response?.error?.data);
      if (response.error) {
        toast.error(`${response?.error?.data?.message}`);
      }
    }
  };

  const calculateTotal = () => {
    return cartItems?.data?.reduce((total, item) => {
      const discountAmount =
        (item?.productId?.productPrice * item?.productId?.discount) / 100;
      const discountedPrice = item?.productId?.productPrice - discountAmount;
      return total + discountedPrice * item?.quantity;
    }, 0);
  };
  const totalAmount = calculateTotal();
  const total = totalAmount?.toFixed(2);

  return (
    <div className=" pb-8">
      {!user ? (
        <section className="relative z-10  flex flex-col justify-center text-center min-h-[60vh]">
          <div className="flex justify-center">
            <div className="w-full  ">
              <h4 className="mb-3 text-base md:text-lg font-semibold text-red-800">
                You are not logged in
              </h4>
              <h4 className="mb-6  text-sm md:text-lg font-medium text-gray-600">
                Please log in to view your cart items
              </h4>
              <Link
                href="/account/login"
                className="bg-primary px-2 py-2 rounded text-primary-foreground shadow hover:bg-hover "
              >
                Go To Login
              </Link>
            </div>
          </div>
        </section>
      ) : cartLoading ? (
        <div className=" flex flex-col justify-center text-center min-h-[60vh]">
          <Loading />
        </div>
      ) : cartItems?.data.length === 0 ? (
        <div className="relative z-10  flex flex-col items-center justify-center text-center min-h-[60vh]">
          <div className="flex justify-center items-center">
            <div className="w-full ">
              <div className="text-[50px] flex justify-center items-center ">
                <MdSearchOff />
              </div>

              <h4 className="mb-3  text-base md:text-lg font-semibold text-red-800">
                Oops! Your cart is empty!
              </h4>
              <h4 className="mb-6  text-sm md:text-base font-medium text-gray-600">
                Please add some products from this page
              </h4>
              <Link
                href="/products"
                className="bg-primary hover:bg-hover text-sm px-2 py-2 text-primary-foreground rounded shadow uppercase"
              >
                Add Products
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="my-6">
          <div className="mb-4 flex justify-end">
            <Button onClick={handleRemoveAllItem} disabled={AllDeleteStatus}>
              Remove All
            </Button>
          </div>
          <div className="space-y-4 ">
            {cartItems?.data
              ?.filter((item) => item.productId !== null)
              .map((item) => (
                <div key={item._id}>
                  <CartItem
                    item={item}
                    onRemove={handleRemoveItem}
                    onUpdateQuantity={handleUpdateQuantity}
                    deleteStatus={deleteStatus}
                    updateStatus={updateStatus}
                  />
                  <hr className="mt-4 border-gray-300" />
                </div>
              ))}
          </div>
          <div className="mt-4 space-y-3">
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>AU$ {total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
