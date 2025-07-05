"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaEdit } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  useDeleteCategoryMutation,
  useGetAllCategoryQuery,
} from "@/lib/services/category";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import slugify from "slugify";
import Loading from "@/components/Loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AOS from "aos";
import "aos/dist/aos.css";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const categoriesPerPage = 10;
  const router = useRouter();
  const {
    data: categoryData,
    isLoading,
    isError,
    isSuccess,
    status: getCategoryStatus,
  } = useGetAllCategoryQuery();
  const [deleteCategory, status] = useDeleteCategoryMutation();

  useEffect(() => {
    if (categoryData?.categories || isSuccess) {
      setCategories(categoryData.categories);
      console.log(categoryData);
    } else if (isError) {
      toast.error(`${getCategoryStatus?.error?.data?.error}..`);
    }
  }, [categoryData]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [categoryData]);

  // Pagination calculation
  const indexOfLastCategory = currentPage * categoriesPerPage;
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
  const currentCategories = categories.slice(
    indexOfFirstCategory,
    indexOfLastCategory
  );
  const totalPages = Math.ceil(categories.length / categoriesPerPage);

  const handleDelete = async (id) => {
    console.log(id);
    try {
      const response = await deleteCategory(id);
      console.log(response);
      if (response?.data || status?.isSuccess) {
        toast.success(`${response?.data?.message}!!!`);
      } else if (status?.isError || response?.error) {
        toast.error(`${response?.error?.data?.message}...`);
      }
    } catch (error) {
      toast.error("Error deleting category");
    }
  };

  const handleEdit = (slug) => {
    router.push(`/admin/category/update/${slug}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <div className="flex justify-center items-center  min-h-[30vh]">
        Error fetching categories!
      </div>
    );
  }

  return (
    <div className="w-full  mt-4 mb-8">
      <div className="w-[90%] mx-auto  flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-4">
        <div className="py-4">
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
                <BreadcrumbPage>Manage Category</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Link href={"/admin/category/create"} data-aos="fade-up">
          <Button className="w-full md:w-auto ">
            <Plus style={{ width: "18px", height: "18px" }} />
            <span>Add Category</span>
          </Button>
        </Link>
      </div>

      <div>
        <p className="w-[90%] mx-auto font-bold " data-aos="fade-up">
          Total Categories: {categories.length}
        </p>
      </div>

      {/* Category Table */}
      {currentCategories.length > 0 ? (
        <div className="w-[90%] mx-auto flex flex-col justify-center">
          <Table className="min-w-max" data-aos="fade-right">
            <TableHeader>
              <TableRow className="uppercase text-sm bg-table hover:bg-hoverTable">
                <TableHead className="text-white">Category Image</TableHead>
                <TableHead className="text-white">Category Name</TableHead>

                <TableHead className="text-white">Created At</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="capitalize">
              {currentCategories.map((category) => (
                <TableRow
                  key={category._id}
                  className="hover:bg-secondaryTable"
                >
                  <TableCell>
                    {/* Display Category Image */}
                    <img
                      className="h-[50px] w-[50px] object-contain rounded-lg"
                      src={category?.categoryImage}
                      alt={`category-image-${category._id}`}
                    />
                  </TableCell>
                  <TableCell>{category?.categoryName}</TableCell>

                  <TableCell>{formatDate(category?.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          const slug = slugify(
                            category?.categoryName
                          ).toLowerCase();
                          handleEdit(slug);
                        }}
                        className="bg-table hover:bg-hoverTable flex gap-1 items-center text-white px-2 py-1 rounded "
                      >
                        <FaEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(category?._id)}
                        className="bg-red-700 flex items-center gap-1 text-white px-2 py-1 rounded hover:bg-red-800"
                      >
                        <Trash2 style={{ width: "15px", height: "15px" }} />
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div
          className="flex flex-col items-center justify-center min-h-[50vh]"
          data-aos="fade-up"
        >
          No categories found here...
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 items-center mt-5 w-[90%] pb-8 md:pb-8 mx-auto">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
          >
            <FaChevronLeft />
          </button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
