"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
} from "react-icons/fa";
import { Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  useDeleteProductMutation,
  useGetAllProductQuery,
} from "@/lib/services/product";
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
import { MdSearchOff } from "react-icons/md";

import AOS from "aos";
import "aos/dist/aos.css";

const productsPerPage = 20;

const ProductList = () => {
  const { data: productData, isLoading, isError } = useGetAllProductQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // Initialize AOS once
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [productData]);

  // Reset current page when products or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, productData]);

  const products = productData?.products || [];

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const searchTerm = search.toLowerCase();
    return products.filter(
      (product) =>
        product.productName.toLowerCase().includes(searchTerm) ||
        product.category?.categoryName?.toLowerCase().includes(searchTerm)
    );
  }, [products, search]);

  const totalPages = useMemo(
    () => Math.ceil(filteredProducts.length / productsPerPage),
    [filteredProducts]
  );

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [currentPage, filteredProducts]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        const response = await deleteProduct(id);
        if (response?.data?.message) {
          toast.success(response.data.message);
        } else if (response?.error?.data?.message) {
          toast.error(response.error.data.message);
        }
      } catch {
        toast.error("Error deleting product");
      }
    },
    [deleteProduct]
  );

  const handleEdit = useCallback(
    (slug) => {
      router.push(`/admin/product/update/${slug}`);
    },
    [router]
  );

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US");
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  if (isLoading) return <Loading />;

  if (isError)
    return (
      <div className="flex justify-center items-center min-h-[30vh]">
        Error fetching products!
      </div>
    );

  return (
    <div className="w-full mt-4 mb-8">
      <div className="w-[90%] mx-auto flex flex-col xl:flex-row justify-between xl:items-center gap-4 ">
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
                <BreadcrumbPage>Manage Product</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div
          className="flex flex-col md:flex-row md:justify-between gap-4"
          data-aos="fade-up"
        >
          <div className="flex items-center relative w-full ">
            <Input
              type="text"
              placeholder="Search Products..."
              className="pr-20 w-full border border-gray-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <Link href={"/admin/product/create"}>
            <Button className="w-full md:w-auto mt-4 md:mt-0">
              <Plus style={{ width: "18px", height: "18px" }} />
              <span>Add Product</span>
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <p className="w-[90%] mx-auto font-bold mt-4 ">
          Total Products: {filteredProducts.length}
        </p>
      </div>

      {/* Product Table */}
      {!isLoading && currentProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh]">
          <MdSearchOff className="text-[70px]" />
          <h2 className="text-2xl md:text-4xl font-semibold text-red-800 ">
            Oops! No results found
          </h2>
          <p className="text-sm text-gray-500  mt-2 mb-6 max-w-sm text-center">
            We couldn't find any matches for your search. Please try different
            keywords.
          </p>
        </div>
      ) : (
        <div className="w-[90%] mx-auto flex flex-col justify-center ">
          <Table className="min-w-max " data-aos="fade-right">
            <TableHeader>
              <TableRow className="uppercase text-sm bg-table hover:bg-hoverTable ">
                <TableHead className="text-white">Image</TableHead>
                <TableHead className="text-white">Product Name</TableHead>
                <TableHead className="text-white">SEO Keywords</TableHead>
                <TableHead className="text-white">Stock Keeping Unit</TableHead>
                <TableHead className="text-white">Category</TableHead>
                <TableHead className="text-white">Price</TableHead>
                <TableHead className="text-white">Discount(%)</TableHead>
                <TableHead className="text-white">Total Stock Qty</TableHead>
                <TableHead className="text-white">Created At</TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="capitalize ">
              {currentProducts.map((product) => (
                <TableRow key={product._id} className="hover:bg-secondaryTable">
                  <TableCell>
                    <div className="flex gap-1">
                      {product?.productImageUrls?.map((img, index) => (
                        <img
                          key={index}
                          className="h-[50px] w-[50px] object-contain rounded-lg"
                          src={img}
                          alt={`product-image-${index}`}
                        />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-sm">
                    {product?.productName}
                  </TableCell>
                  <TableCell className="max-w-sm">
                    {product?.keywords}
                  </TableCell>
                  <TableCell>{product?.SKU}</TableCell>
                  <TableCell>{product?.category?.categoryName}</TableCell>
                  <TableCell>AU$ {product?.productPrice}</TableCell>
                  <TableCell>{product?.discount}%</TableCell>
                  <TableCell>{product?.productTotalStockQty}</TableCell>
                  <TableCell>{formatDate(product?.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() =>
                          handleEdit(
                            slugify(product?.productName, { lower: true })
                          )
                        }
                        className="bg-table hover:bg-hoverTable flex gap-1 items-center text-white px-2 py-1 rounded "
                      >
                        <FaEdit />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product?._id)}
                        className="bg-red-800 hover:bg-red-900 flex items-center gap-1 text-white px-2 py-1 rounded  disabled:opacity-50"
                        disabled={isDeleting}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 items-center mt-5 w-[90%] pb-8 md:pb-8 mx-auto">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
          >
            <FaChevronLeft />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
          >
            <FaChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductList;
