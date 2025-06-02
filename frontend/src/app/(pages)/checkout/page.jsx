"use client";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import AOS from "aos";
import "aos/dist/aos.css";

import { FcAddressBook } from "react-icons/fc";
import { FaMapLocationDot, FaPhone } from "react-icons/fa6";
import { MdRealEstateAgent } from "react-icons/md";
import { MdOutlineLocationCity } from "react-icons/md";
import { RiUser3Fill } from "react-icons/ri";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useFetchCartQuery } from "@/lib/services/cart";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetAllAddressesQuery } from "@/lib/services/address";
import { useAddToOrderStripeMutation } from "@/lib/services/order";
import { useGetUserQuery } from "@/lib/services/auth";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Loading from "@/components/Loading";
import { checkoutValidationSchema } from "@/validation/schemas";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IoLocation } from "react-icons/io5";

const SelectedItem = ({ item }) => {
  const { productId, quantity } = item;
  const { productPrice, discount, productImageUrls, productName, category } =
    productId;
  const discountAmount = (productPrice * discount) / 100;
  const discountedPrice = productPrice - discountAmount;

  return (
    <>
      <div className="flex flex-col rounded-lg sm:flex-row">
        <img
          src={productImageUrls[0]}
          alt={productName}
          className="m-2 h-24 w-28 rounded-md border bg-white object-contain object-center"
        />
        <div className="flex w-full flex-col px-4 py-4">
          <h3 className=" font-semibold capitalize ">{productName}</h3>
          <h6 className=" float-right text-base text-primary ">
            {" "}
            Quantity : {quantity}
          </h6>
          {discountedPrice === productPrice ? (
            <h6 className="text-lg  font-bold ">AU$ {productPrice}</h6>
          ) : (
            <div className="flex items-center gap-2">
              <h6 className="text-sm text-red-500 line-through">
                AU$ {productPrice}
              </h6>
              <h6 className="text-lg  font-semibold ">AU$ {discountedPrice}</h6>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const Checkout = () => {
  const { data, isSuccess, error: fetchError } = useGetUserQuery();
  const [addToOrderStripe] = useAddToOrderStripeMutation();
  const { data: response, isLoading: addressLoading } =
    useGetAllAddressesQuery();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [shipping, setShipping] = useState(0);

  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    }
  }, [data, isSuccess]);
  const userRole = user?.roles[0];

  const {
    data: cartItems,
    isLoading,
    error,
  } = useFetchCartQuery({ userId: user?._id }, { skip: !user?._id });

  useEffect(() => {
    if (cartItems?.data) {
      formik.setFieldValue("cart", cartItems?.data);
      formik.setFieldValue("fullName", user?.name);
      formik.setFieldValue("email", user?.email);
      formik.setFieldValue("phone", user?.number);
    }
  }, [cartItems?.data, user]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [cartItems, data, response]);

  const calculateTotal = () => {
    return cartItems?.data.reduce((total, item) => {
      const discountAmount =
        (item?.productId?.productPrice * item?.productId?.discount) / 100;
      const discountedPrice = item?.productId?.productPrice - discountAmount;
      return total + discountedPrice * item.quantity;
    }, 0);
  };

  useEffect(() => {
    const calculateShipping = () => {
      return selectedAddress?.DeliveryCharge || 0;
    };
    setShipping(calculateShipping());
  }, [selectedAddress]);

  const formik = useFormik({
    initialValues: {
      cart: [],
      fullName: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      zip: "",
      address: null,
      paymentMethod: "",
    },
    validationSchema: checkoutValidationSchema,
    onSubmit: async (values) => {
      if (values.paymentMethod === "stripe") {
        if (total < 150) {
          toast.error("At least AU$150 is required to proceed.");
          return;
        }
        const stripePromise = await loadStripe(
          `${process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY}`
        );
        const res = await addToOrderStripe(values);

        if (res?.error.data?.id) {
          await stripePromise.redirectToCheckout({
            sessionId: res?.error.data?.id,
          });
        } else {
          alert("Stripe payment failed: invalid session ID");
        }
        console.log("Stripe payment", values);
        // Integrate Stripe payment processing logic here
      } else {
        alert("Please select a payment method.");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        <Loading />
      </div>
    );
  }
  if (error)
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        {error?.data?.message}
      </div>
    );

  const totalAmount = calculateTotal();
  const SubTotal = totalAmount?.toFixed(2);
  const total = (Number(SubTotal) + Number(shipping)).toFixed(2);

  return (
    <div className=" w-full container mx-auto md:p-4 py-8">
      <div className="px-4 py-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Checkout</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      {!user ? (
        <section
          className="relative z-10 py-[120px] flex flex-col justify-center text-center min-h-[70vh]"
          data-aos="fade-up"
        >
          <div className="container mx-auto">
            <div className="flex justify-center">
              <div className="w-full px-4 max-w-lg">
                <h4 className="mb-3 text-xl md:text-3xl font-semibold text-red-800">
                  You are not logged in
                </h4>
                <h4 className="mb-6 text-lg font-medium text-gray-600">
                  Please logIn Proceed to Checkout
                </h4>
                <Link
                  href="account/login"
                  className="bg-primary px-6 py-2 rounded text-primary-foreground shadow hover:bg-primary/90"
                >
                  Go To Login
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : isLoading ? (
        <div className=" flex flex-col justify-center text-center min-h-[70vh]">
          <Loading />
        </div>
      ) : cartItems?.data.length === 0 ? (
        <section
          className="relative  flex flex-col justify-center text-center min-h-[70vh]"
          data-aos="fade-up"
        >
          <div className="flex justify-center">
            <div className="w-full px-4 max-w-lg">
              <h4 className="mb-3 text-xl md:text-3xl font-semibold text-red-800">
                Your product items is empty!
              </h4>
              <h4 className="mb-6 text-lg font-medium text-gray-600">
                Please add some products from this page
              </h4>
              <Link
                href="/products"
                className="bg-primary px-6 py-2 rounded text-primary-foreground shadow hover:bg-primary/90"
              >
                Add Products
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div data-aos="fade-up">
          <div className="grid  lg:grid-cols-2 gap-4 my-4 ">
            <div className=" mx-4" data-aos="fade-right">
              <p className="text-xl ">Order Summary</p>
              <p className="text-gray-400 text-base">
                Check your items. And select a suitable shipping method.
              </p>
              <Card className="mt-8 space-y-3    px-2 py-4   sm:px-6">
                {cartItems?.data.map((item) => (
                  <div key={item._id}>
                    <SelectedItem item={item} />
                  </div>
                ))}
              </Card>
              <div className=" pt-8">
                <div className="mt-8 flex gap-2 text-lg font-medium">
                  Choose Payment Method
                  <p className="text-red-500">*</p>
                </div>
                <form className="mt-5">
                  <div className=" grid gap-6">
                    <div className="relative">
                      <Input
                        className="peer hidden"
                        type="radio"
                        name="paymentMethod"
                        id="radio_1"
                        value="paypal"
                        onChange={formik.handleChange}
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                        htmlFor="radio_1"
                      >
                        <img
                          className="w-8 md:w-14 object-contain"
                          src="/paypal.png"
                          alt="Pay with Paypal"
                        />
                        <div className="ml-2 md:ml-5">
                          <span className="mt-2 font-semibold">
                            Pay with Paypal
                          </span>
                        </div>
                      </label>
                    </div>

                    <div className="relative">
                      <Input
                        className="peer hidden"
                        type="radio"
                        name="paymentMethod"
                        id="radio_2"
                        value="stripe"
                        onChange={formik.handleChange}
                      />
                      <span className="peer-checked:border-gray-700 absolute right-4 top-1/2 box-content block h-3 w-3 -translate-y-1/2 rounded-full border-8 border-gray-300 bg-white" />
                      <label
                        className="peer-checked:border-2 peer-checked:border-gray-700 peer-checked:bg-gray-50 flex cursor-pointer select-none rounded-lg border border-gray-300 p-4"
                        htmlFor="radio_2"
                      >
                        <img
                          className="w-8 md:w-14 object-contain"
                          src="card.png"
                          alt="Pay with card"
                        />
                        <div className="ml-2 md:ml-5">
                          <span className="mt-2 font-semibold">
                            Pay with Card or Stripe
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                  {formik.touched.paymentMethod &&
                    formik.errors.paymentMethod && (
                      <div className="text-red-500 text-sm mt-2">
                        {formik.errors.paymentMethod}
                      </div>
                    )}
                </form>
              </div>
            </div>
            <div className="" data-aos="fade-left">
              <div className="bg-gray-50  px-4 mt-10 py-8 lg:mt-0 ">
                <p className="text-xl font-medium">Persional Details</p>
                <p className="text-gray-400">
                  Complete your order by providing your details.
                </p>
                <form>
                  <div>
                    <div className="grid sm:grid-cols-2 gap-4 ">
                      <div>
                        <div className="relative w-full">
                          <Label className="mt-2 mb-2 text-sm font-medium flex gap-2">
                            Select Shipping Address
                            <p className="text-red-500">*</p>
                          </Label>
                          <Select
                            value={formik.values.address?._id || ""}
                            onValueChange={(value) => {
                              const selectedAddress = response?.addresses.find(
                                (address) => address?._id === value
                              );
                              setSelectedAddress(selectedAddress);
                              formik.setFieldValue("address", selectedAddress);
                              formik.setFieldTouched("address", true);
                            }}
                            onBlur={() =>
                              formik.setFieldTouched("address", true, true)
                            }
                          >
                            <SelectTrigger className="w-full rounded-md bg-white border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none ">
                              <SelectValue placeholder="Select Address" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Addresses</SelectLabel>
                                {response?.addresses?.length > 0 &&
                                  response?.addresses?.map((address) => (
                                    <SelectItem
                                      key={address?._id}
                                      value={address?._id}
                                    >
                                      {address?.Address}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>{" "}
                          <div className="pointer-events-none absolute inset-y-0 top-1/2 left-0 inline-flex items-center px-3">
                            <IoLocation className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {formik.touched.address &&
                          formik.errors.address &&
                          !selectedAddress && (
                            <div className="text-red-500 text-xs">
                              {formik.errors.address}
                            </div>
                          )}
                      </div>

                      <div>
                        <div className="relative w-full">
                          <Label className="mt-2 mb-2  text-sm font-medium flex gap-2">
                            City
                            <p className="text-red-500">*</p>
                          </Label>
                          <Input
                            type="text"
                            name="city"
                            className="w-full rounded-md bg-white border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none "
                            value={formik.values.city}
                            onChange={formik.handleChange}
                            placeholder="Enter City"
                          />
                          <div className="pointer-events-none absolute top-1/2  inset-y-0 left-0 inline-flex items-center px-3">
                            <MdOutlineLocationCity className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>

                        {formik.touched.city && formik.errors.city && (
                          <div className="text-red-500 text-xs">
                            {formik.errors.city}
                          </div>
                        )}
                      </div>

                      <div className="w-full">
                        <div className="relative">
                          <Label className="mt-2 mb-2  text-sm font-medium flex gap-2">
                            State
                            <p className="text-red-500">*</p>
                          </Label>
                          <Input
                            type="text"
                            name="state"
                            value={formik.values.state}
                            className="w-full rounded-md bg-white border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none "
                            onChange={formik.handleChange}
                            placeholder="Enter State"
                          />
                          <div className="pointer-events-none absolute top-1/2  inset-y-0 left-0 inline-flex items-center px-3">
                            <MdRealEstateAgent className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        {formik.touched.state && formik.errors.state && (
                          <div className="text-red-500 text-xs">
                            {formik.errors.state}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="relative w-full">
                          <Label className="mt-2 mb-2  text-sm font-medium flex gap-2">
                            Zip Code
                            <p className="text-red-500">*</p>
                          </Label>
                          <Input
                            type="text"
                            name="zip"
                            value={formik.values.zip}
                            className="w-full rounded-md bg-white border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none "
                            onChange={formik.handleChange}
                            placeholder="Zip Code"
                          />
                          <div className="pointer-events-none absolute  top-1/2 inset-y-0 left-0 inline-flex items-center px-3">
                            <FaMapLocationDot className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        {formik.touched.zip && formik.errors.zip && (
                          <div className="text-red-500 text-xs">
                            {formik.errors.zip}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="relative w-full">
                          <Label className="mt-2 mb-2  text-sm font-medium flex gap-2 ">
                            Name
                            <p className="text-red-500">*</p>
                          </Label>
                          <Input
                            type="text"
                            name="fullName"
                            className="w-full rounded-md bg-white border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none "
                            value={formik.values.fullName}
                            onChange={formik.handleChange}
                            placeholder="Enter Name"
                          />
                          <div className="pointer-events-none absolute top-1/2  inset-y-0 left-0 inline-flex items-center px-3">
                            <RiUser3Fill className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        {formik.touched.fullName && formik.errors.fullName && (
                          <div className="text-red-500 text-xs">
                            {formik.errors.fullName}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="relative w-full">
                          <Label className="mt-2 mb-2  text-sm font-medium flex gap-2">
                            Email
                            <p className="text-red-500">*</p>
                          </Label>
                          <Input
                            type="email"
                            name="email"
                            className="w-full rounded-md bg-white border border-gray-200 px-4 py-3 pl-11 text-sm shadow-sm outline-none "
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            placeholder="Enter email"
                          />
                          <div className="pointer-events-none absolute top-1/2  inset-y-0 left-0 inline-flex items-center px-3">
                            <FcAddressBook className="h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        {formik.touched.email && formik.errors.email && (
                          <div className="text-red-500 text-xs">
                            {formik.errors.email}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="relative w-full">
                          <Label className="mt-2 mb-2  text-sm font-medium flex gap-2">
                            Phone No
                            <p className="text-red-500">*</p>
                          </Label>
                          <PhoneInput
                            international
                            defaultCountry="AU"
                            type="string"
                            name="phone"
                            className="w-full rounded-md bg-white border border-gray-200 px-4 py-2  text-sm shadow-sm outline-none "
                            value={formik.values.phone}
                            onChange={(phone) =>
                              formik.setFieldValue("phone", phone)
                            }
                            placeholder="Phone No."
                          />
                          {/* <div className="pointer-events-none absolute top-1/2  inset-y-0 left-0 inline-flex items-center px-3">
                            <FaPhone className="h-4 w-4 text-gray-400" />
                          </div> */}
                        </div>

                        {formik.touched.phone && formik.errors.phone && (
                          <div className="text-red-500 text-xs">
                            {formik.errors.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Total */}
                    <div className="mt-6 border-t border-b py-2">
                      <div className="flex items-center justify-between font-medium text-gray-900">
                        <p>Subtotal</p>
                        <p>AU$ {SubTotal}</p>
                      </div>
                      <div className="flex items-center justify-between font-medium text-gray-900">
                        <p>Shipping</p>
                        <p>AU$ {shipping}</p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between text-2xl font-medium text-gray-900">
                      <p>Total</p>
                      <p>AU$ {total}</p>
                    </div>
                  </div>
                </form>
                {formik.values.paymentMethod === "paypal" ? (
                  <div className="z-0 relative">
                    <PayPalButtons
                      onSubmit={formik.handleSubmit}
                      style={{
                        layout: "horizontal",
                        color: "gold",
                        label: "paypal",
                        position: "relative",
                      }}
                      className="px-6 py-5 mb-6 w-auto"
                      disabled={
                        !selectedAddress ||
                        !formik.values.address ||
                        !formik.values.cart ||
                        !formik.values.city ||
                        !formik.values.email ||
                        !formik.values.fullName ||
                        !formik.values.phone ||
                        !formik.values.state ||
                        !formik.values.zip
                      }
                      createOrder={async () => {
                        if (total < 150) {
                          toast.error(
                            "At least AU$150 is required to proceed."
                          );
                          return;
                        }
                        try {
                          const response = await fetch(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/order-paypal`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(formik.values),
                              credentials: "include",
                            }
                          );
                          const orderData = await response.json();
                          if (orderData?.id) {
                            return orderData?.id;
                          } else {
                            const errorDetail = orderData?.details?.[0];
                            const errorMessage = errorDetail
                              ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                              : JSON.stringify(orderData);
                            throw new Error(errorMessage);
                          }
                        } catch (error) {
                          console.error(error);
                          toast.error(error?.message);
                        }
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          const response = await fetch(
                            `${process.env.NEXT_PUBLIC_BACKEND_URL}/order-paypal/${data?.orderID}/capture`,
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(formik.values),
                              credentials: "include",
                            }
                          );
                          const orderData = await response.json();
                          toast.success(`${response?.message}`);
                          if (userRole === "admin") {
                            router.push("/admin/my-order");
                          } else if (userRole === "user") {
                            router.push("/user/order");
                          }
                        } catch (error) {
                          if (error.message.includes("Authorization")) {
                            toast.error(
                              "Authorization failed. Please check your payment method."
                            );
                          } else if (error.message.includes("NetworkError")) {
                            toast.error(
                              "Network error occurred. Please check your connection and try again."
                            );
                          } else {
                            toast.error(
                              `Sorry, your transaction could not be processed. ${error.message}`
                            );
                          }
                          router.push("/products");
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Button
                    type="submit"
                    className="w-full mt-3"
                    onClick={formik.handleSubmit}
                    disabled={
                      !selectedAddress ||
                      !formik.values.address ||
                      !formik.values.cart ||
                      !formik.values.city ||
                      !formik.values.email ||
                      !formik.values.fullName ||
                      !formik.values.phone ||
                      !formik.values.state ||
                      !formik.values.zip
                    }
                  >
                    Complete Purchase
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
