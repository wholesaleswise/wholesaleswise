"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaEdit } from "react-icons/fa";
import { Search, Share2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useGetSingleProductQuery,
  useAddReviewMutation,
  useDeleteReviewMutation,
  useEditReviewMutationRTK,
} from "@/lib/services/product";

import RatingStars from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import CategroyProduct from "@/components/home/CategoryProduct";
import { useGetUserQuery } from "@/lib/services/auth";
import { useAddToCartMutation } from "@/lib/services/cart";
import { AiOutlineShoppingCart } from "react-icons/ai";
import Loading from "@/components/Loading";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  FacebookShareButton,
  FacebookIcon,
  WhatsappShareButton,
  WhatsappIcon,
  TwitterShareButton,
  TwitterIcon,
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon,
  PinterestShareButton,
  PinterestIcon,
  LinkedinShareButton,
  LinkedinIcon,
} from "react-share";
import CategroyWiseProductDisplay from "@/components/CategroyWiseProductDisplay";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="absolute top-4 right-4 text-xl" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const SingleProduct = ({ slug }) => {
  const router = useRouter();
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareRef = useRef();

  const {
    data: singleProductData,
    error: getsingleProductErrorDetails,
    isError: getsingleProductError,
    isSuccess: getsingleProductSuccess,
    isLoading,
  } = useGetSingleProductQuery(slug);

  const [
    addReview,
    {
      isLoading: addLoading,
      isSuccess: addSuccess,
      isError: addError,
      error: addErrorDetails,
    },
  ] = useAddReviewMutation();

  const [
    updateReview,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useEditReviewMutationRTK();
  const [
    deleteReview,
    {
      isSuccess: deleteSuccess,
      isError: deleteError,
      error: deleteErrorDetails,
    },
  ] = useDeleteReviewMutation();
  const [
    addToCart,
    {
      isSuccess: cartSuccess,
      isLoading: CartLoading,
      isError: cartError,
      error: cartErrorDetails,
    },
  ] = useAddToCartMutation();

  const [productData, setProductData] = useState(null);
  const [reviewContent, setReviewContent] = useState("");
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImage, setActiveImage] = useState("");

  const { data: userData, isSuccess: userSuccess } = useGetUserQuery();

  useEffect(() => {
    if (slug) {
      if (getsingleProductSuccess) {
        setProductData(singleProductData?.product);
      } else if (getsingleProductError) {
        console.error("Error fetching product:", getsingleProductErrorDetails);
        toast.error(
          getsingleProductErrorDetails?.data?.message ||
            "Failed to load product."
        );
      }
    }
  }, [
    slug,
    getsingleProductError,
    getsingleProductSuccess,
    getsingleProductErrorDetails,
  ]);

  useEffect(() => {
    if (userData && userSuccess) {
      setUser(userData.user);
    }
  }, [userData, userSuccess]);

  const handleMouseEnterProduct = useCallback((imageURL) => {
    setActiveImage(imageURL);
  }, []);

  useEffect(() => {
    if (productData?.productImageUrls?.length > 0) {
      setActiveImage(productData?.productImageUrls[0]);
    }
  }, [productData?.productImageUrls]);

  const discountAmount =
    (productData?.productPrice * productData?.discount) / 100;
  const discountedPrice = productData?.productPrice - discountAmount;

  const handleAddToCartClick = useCallback(
    async (id) => {
      if (!user?._id) {
        sessionStorage.setItem("redirectUrl", window.location.pathname);
        router.push("/account/login");
        toast.error("Please log in to add to cart.");
        return;
      }

      if (id && productData) {
        const res = await addToCart({ id, userId: user?._id });
        if (res?.data || cartSuccess) {
          toast.success(res?.data?.message || "Product added to cart!");
        } else if (cartError || res?.error) {
          console.error(
            "Error adding to cart:",
            res?.error || cartErrorDetails
          );
          toast.error(res?.error?.data?.message || "Failed to add to cart.");
        }
      }
    },
    [addToCart, cartError, cartSuccess, productData, router, user]
  );

  const handleEditReviewClick = useCallback(
    (review) => {
      if (!user?._id) {
        sessionStorage.setItem("redirectUrl", window.location.pathname);
        router.push("/account/login");
        toast.error("Please log in to edit your review.");
        return;
      }
      setReviewContent(review?.reviewContent);
      setRating(review?.rating);
      setEditingReview(review);
      setIsModalOpen(true);
    },
    [router, user]
  );

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setEditingReview(null);
    setReviewContent("");
    setRating(0);
  }, []);

  const handleDeleteReview = useCallback(
    async (slug, id) => {
      if (!user?._id) {
        sessionStorage.setItem("redirectUrl", window.location.pathname);
        router.push("/account/login");
        toast.error("Please log in to delete your review.");
        return;
      }
      try {
        const response = await deleteReview({ slug, reviewId: id });
        if (response?.data || deleteSuccess) {
          toast.success(
            response?.data?.message || "Review deleted successfully!"
          );
          window.location.reload();
        } else if (deleteError || response?.error) {
          console.error(
            "Error deleting review:",
            response?.error || deleteErrorDetails
          );
          toast.error(
            response?.error?.data?.message || "Failed to delete review."
          );
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("Error deleting review.");
      }
    },
    [deleteError, deleteSuccess, deleteReview, router, user]
  );
  console.log(rating);
  const handleSubmitReview = useCallback(
    async (e) => {
      e.preventDefault();

      if (!user?._id) {
        sessionStorage.setItem("redirectUrl", window.location.pathname);
        router.push("/account/login");
        toast.error("Please log in to add a review.");
        return;
      }

      if (!rating || rating < 1 || rating > 5) {
        toast.error("Please provide a valid  rating between 1 and 5.");
        return;
      }
      if (!reviewContent) {
        toast.error("Review must required.");
        return;
      }
      if (reviewContent.length < 50 || reviewContent.length > 500) {
        toast.error("Review must be between 50 and 500 characters.");
        return;
      }
      const reviewData = {
        reviewContent,
        rating,
        userId: user?._id,
        reviewerName: user?.name,
      };

      try {
        let response;
        if (editingReview) {
          response = await updateReview({
            reviewData,
            slug: editingReview?.productSlug,
            reviewId: editingReview?._id,
          }).unwrap();

          if (updateSuccess) {
            toast.success(response?.message || "Review updated successfully!");
            window.location.reload();
          } else if (updateError) {
            console.error("Error updating review:", updateErrorDetails);
            toast.error(
              updateErrorDetails?.data?.error || "Failed to update review."
            );
          }
        } else {
          response = await addReview({
            slug: productData?.slug,
            reviewData,
          }).unwrap();
          if (addSuccess || response) {
            toast.success(response?.message || "Review added successfully!");

            window.location.reload();
          } else if (addError || response?.error) {
            console.error("Error adding review:", addErrorDetails);
            toast.error(
              addErrorDetails?.data?.error || "Failed to add review."
            );
          }
        }
        setIsModalOpen(false);
        setReviewContent("");
        setRating(0);
        setEditingReview(null);
      } catch (error) {
        console.error("Error submitting review:", error);
        toast.error(
          error?.data?.message ||
            "An error occurred while submitting your review."
        );
      }
    },
    [
      addError,
      addSuccess,
      addReview,
      editingReview,
      productData?.slug,
      rating,
      reviewContent,
      router,
      updateError,
      updateSuccess,
      updateReview,
      user,
    ]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const title = `Check out this product: ${productData?.productName}`;
  const shareImage = productData?.productImageUrls?.[0];

  if (isLoading) {
    return <Loading />;
  }

  if (!productData) {
    return (
      <div className="min-h-[70vh] flex mt-4 justify-center items-center">
        <div className="flex flex-col items-center justify-center text-center px-6 py-12 animate-fadeIn">
          <Search className="w-20 h-20 md:w-32 md:h-32 mb-6" />
          <h2 className="text-xl md:text-3xl font-semibold text-slate-700 dark:text-slate-200">
            Product Not Found!!
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6 max-w-md">
            Try Another.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="container  p-4 mx-auto">
      <div>
        <div className="pt-4 flex gap-5 justify-between">
          <div>
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
                    <Link href="/products">Products</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{productData?.productName}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="relative mb-6 " ref={shareRef}>
            <Button
              variant="outline"
              className="bg-gray-100 float-right "
              onClick={() => setShowShareOptions((prev) => !prev)}
            >
              <Share2 />
            </Button>

            {showShareOptions && (
              <div className="absolute right-0 top-10 z-50 bg-white p-3 rounded-md border shadow-md flex flex-wrap gap-3 w-[300px]">
                <FacebookShareButton url={shareUrl} quote={title}>
                  <FacebookIcon size={32} round />
                </FacebookShareButton>

                <WhatsappShareButton url={shareUrl} title={title}>
                  <WhatsappIcon size={32} round />
                </WhatsappShareButton>

                <TwitterShareButton url={shareUrl} title={title}>
                  <TwitterIcon size={32} round />
                </TwitterShareButton>

                <TelegramShareButton url={shareUrl} title={title}>
                  <TelegramIcon size={32} round />
                </TelegramShareButton>

                <EmailShareButton
                  url={shareUrl}
                  subject={title}
                  body="Check this product out!"
                >
                  <EmailIcon size={32} round />
                </EmailShareButton>

                <PinterestShareButton url={shareUrl} media={shareImage || ""}>
                  <PinterestIcon size={32} round />
                </PinterestShareButton>

                <LinkedinShareButton
                  url={shareUrl}
                  title={title}
                  summary={title}
                >
                  <LinkedinIcon size={32} round />
                </LinkedinShareButton>
              </div>
            )}
          </div>
        </div>
        <div className=" relative border-black pb-4 m-2">
          {/* Product Image Section */}
          <div className="min-h-[200px] flex flex-col  lg:flex-row gap-8 lg:gap-14  md:pt-4">
            <div className=" flex flex-col gap-4">
              <div className="min-h-[350px] h-[300px] w-[300px] sm:h-[350px] sm:w-[350px] lg:h-96 lg:w-96 rounded-md  relative p-2">
                <img
                  src={activeImage || productData?.productImageUrls[0]}
                  className="h-full w-full object-scale-down mix-blend-multiply"
                />
              </div>
              <div className="h-full w-72 sm:w-auto">
                <div className="flex gap-2 overflow-x-auto  h-full max-h-96">
                  {productData?.productImageUrls?.map((imgURL) => (
                    <div className="h-20 w-20  rounded p-1" key={imgURL}>
                      <img
                        src={imgURL}
                        className="w-full  h-full object-scale-down mix-blend-multiply cursor-pointer"
                        onMouseEnter={() => handleMouseEnterProduct(imgURL)}
                        onClick={() => handleMouseEnterProduct(imgURL)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="flex flex-col gap-1 lg:max-h-[120vh] lg:overflow-y-auto scrollbar-none ">
              <h2 className="text-xl lg:text-4xl font-medium capitalize">
                {productData?.productName}
              </h2>
              <p className="font-bold text-yellow-700 rounded-md inline-block w-fit capitalize">
                {productData?.category?.categoryName}
              </p>
              <p className="capitalize ">
                stock keeping unit : {productData?.SKU}
              </p>
              {productData?.productTotalStockQty === 0 ? (
                <div className="px-2 py-1 rounded-md bg-red-600">
                  Out of Stack
                </div>
              ) : (
                <div>
                  Available Stack Qty: {productData?.productTotalStockQty}
                </div>
              )}

              <div className="flex items-center gap-3 mt-1">
                {productData?.rating != 0 && productData.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <p className="text-base ">{productData?.rating}</p>
                    <RatingStars rating={productData?.rating} />
                  </div>
                )}
                {productData?.numReviews != 0 &&
                  productData?.numReviews > 0 && (
                    <>
                      <span className="text-gray-700">|</span>
                      <p className="text-sm ">
                        {productData?.numReviews} Ratings
                      </p>
                    </>
                  )}
              </div>
              <div className="flex items-center gap-2 text-xl lg:text-xl font-medium my-1">
                {discountedPrice === productData?.productPrice ? (
                  <h4 className="text-blue-700 text-xl font-bold">
                    AU$ {discountedPrice}
                  </h4>
                ) : (
                  <>
                    <p className="text-gray-500 text-base">
                      <strike>AU$ {productData?.productPrice}</strike>
                    </p>
                    <h4 className="text-blue-700 text-xl font-bold">
                      AU$ {discountedPrice}
                    </h4>
                  </>
                )}
                {productData?.discount != 0 && productData.discount > 0 && (
                  <div className="flex py-1 px-2 bg-blue-600 text-white font-semibold rounded-lg">
                    <span className=" text-sm">
                      {productData?.discount}% off
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 my-2">
                <Link
                  href={"/products"}
                  className="h-9 px-4 py-2 border border-card rounded-md bg-secondary hover:bg-[#fbcc97]   items-center flex justify-center font-semibold"
                >
                  Shop Now
                </Link>
                <Button
                  type="button"
                  onClick={() => handleAddToCartClick(productData?._id)}
                  disabled={CartLoading}
                >
                  <AiOutlineShoppingCart size={20} />
                  {CartLoading ? (
                    <span>Adding...</span>
                  ) : (
                    <span>Add to cart</span>
                  )}
                </Button>
              </div>

              {/* Product Description */}
              <div className=" md:px-3 ">
                <div className="py-4 prose prose-sm sm:prose md:prose-lg lg:prose-xl max-w-none text-justify leading-7 tracking-wide ">
                  <div
                    className="prose max-w-4xl"
                    dangerouslySetInnerHTML={{
                      __html: productData?.productDescription,
                    }}
                  />
                </div>
              </div>

              <hr />
              <div className=" flex flex-col lg:flex-row justify-between mt-8 gap-4  ">
                <div className="flex order-2 lg:order-1 flex-col max-w-md">
                  <h3 className="text-lg md:text-xl pb-10 font-semibold">
                    Customer Reviews :
                  </h3>
                  <div className="space-y-4 ">
                    {productData?.review?.filter((review) =>
                      review?.status.includes("show")
                    ).length > 0 ? (
                      productData?.review
                        .filter((review) => review?.status.includes("show"))
                        .map((review) => (
                          <div
                            key={review?._id}
                            className=" p-2 rounded-md flex justify-between gap-2 md:gap-10"
                          >
                            <div className="">
                              <div className="flex items-center space-x-2 pb-2">
                                <div className="flex flex-col items-center">
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Avatar
                                          className={`w-7 h-7 cursor-pointer`}
                                        >
                                          <AvatarImage
                                            src={
                                              review?.userId?.picture
                                                ? review.userId.picture
                                                : review?.reviewerName
                                                ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                                    review.reviewerName
                                                  )}`
                                                : null
                                            }
                                            alt={review?.reviewerName}
                                          />
                                          <AvatarFallback>
                                            {review?.reviewerName
                                              ? review?.reviewerName
                                              : null}
                                          </AvatarFallback>
                                        </Avatar>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{review?.reviewerName}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>
                                <span className="text-lg font-semibold text-blue-900 capitalize">
                                  {review?.reviewerName}
                                </span>
                              </div>
                              <RatingStars rating={review?.rating} />
                              <div className=" inline-block max-w-60 xl:max-w-sm mt-2 text-gray-700 capitalize break-words">
                                {review?.reviewContent}
                              </div>
                            </div>
                            {review?.userId?._id === user?._id && (
                              <div className="flex gap-2">
                                <FaEdit
                                  size={20}
                                  className="text-blue-900 cursor-pointer"
                                  onClick={() => handleEditReviewClick(review)}
                                />
                                <Trash2
                                  size={20}
                                  className="text-red-600 cursor-pointer"
                                  onClick={() =>
                                    handleDeleteReview(
                                      review?.productSlug,
                                      review?._id
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500">
                        No reviews yet. Be the first to write a review!
                      </p>
                    )}
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <Button onClick={() => setIsModalOpen(true)}>
                    Add Review
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isModalOpen && (
          <Modal isOpen={isModalOpen} onClose={handleModalClose}>
            <h3 className="text-lg md:text-xl font-semibold mb-4">
              {editingReview ? "Edit Your Review" : "Add a Review"}
            </h3>
            <form onSubmit={handleSubmitReview} className="space-y-4 w-full ">
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-8 h-8 cursor-pointer ${
                      star <= rating ? "text-yellow-600" : "text-gray-400"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                    onClick={() => setRating(star)}
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                ))}
              </div>

              <Textarea
                className="w-full"
                placeholder="Write your review here..."
                rows={4}
                value={reviewContent}
                onChange={(e) => setReviewContent(e.target.value)}
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-md"
                  disabled={addLoading || updateLoading}
                >
                  {addLoading || updateLoading
                    ? "Submitting..."
                    : editingReview
                    ? "Update Review"
                    : "Submit Review"}
                </Button>
              </div>
            </form>
          </Modal>
        )}

        {/* Recommended Products */}
        <div className="pb-12 border-t">
          {productData?.category?.categoryName && (
            <CategroyWiseProductDisplay
              category={productData?.category?.categoryName}
              heading={"Recommended Product :"}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SingleProduct;
