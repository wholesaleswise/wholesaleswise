"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ListFilterPlus,
  ListRestart,
  RotateCw,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import AOS from "aos";
import "aos/dist/aos.css";

import { useGetAllProductQuery } from "@/lib/services/product";
import { useGetAllCategoryQuery } from "@/lib/services/category";

import { Card, CardContent } from "@/components/ui/card";
import Product from "@/components/card/ProductCard";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MdSearchOff } from "react-icons/md";

const Products = () => {
  const searchParams = useSearchParams();
  const newparams = searchParams.get("search") || "";
  const productsPerPage = 10;
  const router = useRouter();

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectCategory, setSelectCategory] = useState({});
  const [filterCategoryList, setFilterCategoryList] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [displayedProductsCount, setDisplayedProductsCount] = useState(10);
  const [selectedDiscountRange, setSelectedDiscountRange] = useState("");

  const discountRanges = [
    { label: "0% - 10%", min: 0, max: 10 },
    { label: "11% - 20%", min: 11, max: 20 },
    { label: "21% - 30%", min: 21, max: 30 },
    { label: "31% - 40%", min: 31, max: 40 },
    { label: "41% - 50%", min: 41, max: 50 },
    { label: "51% and above", min: 51, max: 100 },
  ];

  const {
    data: productData,
    error,
    isError: productError,
    isLoading: productLoading,
  } = useGetAllProductQuery();

  const {
    data: categoryData,
    isError,
    isSuccess,
    status: getCategoryStatus,
  } = useGetAllCategoryQuery();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [searchedProducts]);

  // Set initial product data
  useEffect(() => {
    if (productData?.products) {
      const filteredProducts = productData.products.filter(
        (product) => product.productTotalStockQty > 1
      );
      setData(filteredProducts);
    }
  }, [productData]);

  // Set categories
  useEffect(() => {
    if (categoryData?.categories || isSuccess) {
      setCategories(categoryData.categories);
    } else if (isError) {
      toast.error(`${getCategoryStatus?.error?.data?.error}..`);
    }
  }, [categoryData]);

  // Update selected category list
  useEffect(() => {
    const selectedCategories = Object.keys(selectCategory).filter(
      (categoryKeyName) => selectCategory[categoryKeyName]
    );
    setFilterCategoryList(selectedCategories);
  }, [selectCategory]);

  // Apply filtering + searching + sorting
  useEffect(() => {
    let filtered = data;

    if (filterCategoryList.length > 0) {
      filtered = filtered.filter((product) =>
        filterCategoryList.includes(product.category.categoryName)
      );
    }

    if (newparams) {
      filtered = filtered.filter((product) =>
        product?.productName?.toLowerCase().includes(newparams.toLowerCase())
      );
    }

    if (sortBy === "asc") {
      filtered = [...filtered].sort((a, b) => a.productPrice - b.productPrice);
    } else if (sortBy === "dsc") {
      filtered = [...filtered].sort((a, b) => b.productPrice - a.productPrice);
    }
    if (selectedDiscountRange) {
      const [minDiscount, maxDiscount] = selectedDiscountRange
        .split("-")
        .map(Number);

      filtered = filtered.filter(
        (product) =>
          product?.discount >= minDiscount && product?.discount <= maxDiscount
      );
    }
    setSearchedProducts(filtered);
  }, [newparams, data, filterCategoryList, sortBy, selectedDiscountRange]);

  const checkHandler = (checkBoxType, checkBoxValue) => {
    return filterCategoryList.includes(checkBoxValue);
  };

  const handleLoadMore = () => {
    setDisplayedProductsCount((prevCount) => prevCount + productsPerPage);
  };

  const handleResetFilters = () => {
    setSelectCategory({});
    setSortBy("");
    setDisplayedProductsCount(productsPerPage);
    setSelectedDiscountRange("");
    router.push("/products");
  };

  if (productLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        <Loading />
      </div>
    );
  }

  // Error state
  if (productError) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center">
        {error?.data?.message || "Something went wrong!"}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 my-8">
      <div
        className="flex flex-col gap-6 md:flex md:flex-row justify-between  md:items-center my-3"
        data-aos="fade-down"
      >
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Products</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className=" flex gap-3 flex-wrap">
          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className=" justify-start flex gap-2 p-1"
              >
                <SlidersHorizontal />
                Sort by Price
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortBy}
                onValueChange={(value) => setSortBy(value)}
              >
                <DropdownMenuRadioItem value="asc">
                  Low to High Price
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dsc">
                  High to Low Price
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Dropdown */}
          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className=" flex gap-2 justify-start p-1"
                >
                  <ListFilterPlus />
                  Filter by Category
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto">
                <DropdownMenuLabel>Category</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {categories.map((category) => (
                  <DropdownMenuCheckboxItem
                    key={category._id}
                    checked={checkHandler("category", category?.categoryName)}
                    onCheckedChange={(checked) =>
                      setSelectCategory((prev) => ({
                        ...prev,
                        [category.categoryName]: checked,
                      }))
                    }
                  >
                    {category.categoryName}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className=" justify-start flex gap-2 p-1"
              >
                <SlidersHorizontal />
                Filter by Discount
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Discount Range</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={selectedDiscountRange}
                onValueChange={(value) => setSelectedDiscountRange(value)}
              >
                {discountRanges.map((range, index) => (
                  <DropdownMenuRadioItem
                    key={index}
                    value={`${range.min}-${range.max}`}
                  >
                    {range.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className=" bg-red-600 hover:bg-red-700 hover:text-white font-medium border p-1 text-white"
            onClick={handleResetFilters}
          >
            <ListRestart />
            Reset Filters
          </Button>
        </div>
      </div>

      <div className="mt-5">
        {searchedProducts?.length === 0 ? (
          <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-12">
            <MdSearchOff className="text-[90px]" />
            <h2 className="text-2xl md:text-4xl font-semibold text-red-800 ">
              Oops! No results found
            </h2>
            <p className="text-sm text-gray-500  text-center mt-2 mb-6 max-w-md">
              We couldn't find any matches for your search. Please try different
              keywords or adjust your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="flex gap-1 font-semibold text-gray-600">
              We found
              <h6 className="text-green-500">{searchedProducts?.length}</h6>
              items for you!
            </div>
            <div className="grid mt-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 justify-center gap-4">
              {searchedProducts
                .slice(0, displayedProductsCount)
                .map((product) => (
                  <Card
                    key={product._id}
                    data-aos="fade-up"
                    className="w-full hover:drop-shadow-lg transition-all ease-in-out bg-white shadow"
                  >
                    <CardContent>
                      <Product product={product} />
                    </CardContent>
                  </Card>
                ))}
            </div>

            {searchedProducts.length > displayedProductsCount && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={handleLoadMore}
                  className="px-4 py-2 flex gap-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Load More
                  <RotateCw />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;
