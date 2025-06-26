"use client";
import RatingStars from "@/components/RatingStars";
import { Button } from "@/components/ui/button";
import {
  useEditReviewStatusMutation,
  useGetAllReviewsQuery,
} from "@/lib/services/product";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Loading from "@/components/Loading";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const { data, error, isLoading, isSuccess } = useGetAllReviewsQuery();
  const [
    updateReviewStatus,
    { isLoading: isUpdating, error: updatingError, isSuccess: updateSucces },
  ] = useEditReviewStatusMutation();
  const [sortOrder, setSortOrder] = useState("desc");
  const router = useRouter();
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsPerPage, setReviewsPerPage] = useState(10);

  useEffect(() => {
    if (data && isSuccess) {
      const sortedReviews = [...data?.reviews];
      sortedReviews.sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
      setReviews(sortedReviews);
    }
  }, [data, isSuccess, sortOrder]);

  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);

  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const toggleReviewStatus = async (reviewId, currentStatus) => {
    const newStatus = currentStatus === "show" ? "hide" : "show";
    const response = await updateReviewStatus({ reviewId, newStatus });
    if (updatingError?.status === 401 || response.error) {
      router.push("/account/login");
    } else {
      toast.success(`${response?.error?.data?.message}!!!`);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
  };

  // Pagination Controls
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        <Loading />
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col text-red-500 items-center justify-center min-h-[50vh]">
        {error?.data?.message}
      </div>
    );

  return (
    <div className="container  mx-auto p-4 pt-0">
      <div className="py-6 ">
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
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>All Reviews</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {currentReviews.length > 0 ? (
        <>
          <div className="">
            <Button
              onClick={toggleSortOrder}
              className="mb-4 px-4 py-2 rounded bg-primary hover:bg-hover"
            >
              Sort by Date (
              {sortOrder === "desc" ? "Newest First" : "Oldest First"})
            </Button>

            <Table className="min-w-max  ">
              <TableHeader>
                <TableRow className="uppercase text-base bg-primary hover:bg-hover">
                  <TableHead className="text-white">Reviewer Name</TableHead>
                  <TableHead className="text-white">Product</TableHead>
                  <TableHead className="text-white">Review</TableHead>
                  <TableHead className="text-white">Rating</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Date</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentReviews.map((review) => (
                  <TableRow key={review._id} className=" hover:bg-secondary">
                    <TableCell>{review.reviewerName}</TableCell>
                    <TableCell>{review.productSlug}</TableCell>
                    <TableCell>{review.reviewContent}</TableCell>
                    <TableCell>
                      <RatingStars rating={review?.rating} />
                    </TableCell>
                    <TableCell>{review.status[0]}</TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Button
                        className={`px-4 py-2 w-20 text-white rounded ${
                          review.status.includes("show")
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        onClick={() =>
                          toggleReviewStatus(
                            review._id,
                            review.status.includes("show") ? "show" : "hide"
                          )
                        }
                        disabled={isUpdating}
                      >
                        {review.status.includes("show") ? "Hide" : "Show"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {currentReviews.length > 10 && (
            <div className="flex justify-center items-center mt-4 gap-2">
              <Button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col text-red-500 items-center justify-center min-h-[50vh]">
          No review found here...
        </div>
      )}
    </div>
  );
};

export default Reviews;
