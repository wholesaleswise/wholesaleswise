"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { useFormik } from "formik";
import { productSchema } from "@/validation/schemas";
import {
  useCreateProductMutation,
  useGetSingleProductQuery,
  useUpdateProductMutation,
} from "@/lib/services/product";
import RichTextEditor from "@/components/rich-text-editor";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useGetAllCategoryQuery } from "@/lib/services/category";
import Link from "next/link";

export default function ProductForm({ slug }) {
  const error = "text-xs text-red-600 pt-1";
  const [categories, setCategories] = useState([]);
  const productslug = slug;
  const {
    data: categoryData,
    status: getCategoryStatus,
    isError: getCategoryError,
    isSuccess: getCategorySuccess,
  } = useGetAllCategoryQuery();
  const [
    createProduct,
    {
      isLoading: createLoading,
      isSuccess: createSuccess,
      isError: createError,
      error: createErrorDetails,
    },
  ] = useCreateProductMutation();
  const [
    updateProduct,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdateProductMutation();

  const router = useRouter();

  const [productData, setProductData] = useState(null);
  const [productId, setProductId] = useState(null);
  const {
    data: singleProductData,
    status: getsingleProductStatus,
    isError: getsingleProductError,
    isSuccess: getsingleProductSuccess,
  } = useGetSingleProductQuery(productslug);
  useEffect(() => {
    // Handling product-related logic
    if (productslug) {
      if (getsingleProductSuccess) {
        setProductData(singleProductData?.product);
        setProductId(singleProductData?.product?._id);
      } else if (getsingleProductError) {
        toast.error(`${getsingleProductStatus?.error?.data?.message}..`);
      }
    }
  }, [productslug, productData, getsingleProductSuccess]);

  useEffect(() => {
    // Handling category-related logic
    if (getCategorySuccess) {
      setCategories(categoryData?.categories);
    } else if (getCategoryError) {
      toast.error(`${getCategoryStatus?.error?.data?.message}..`);
    }
  }, [categoryData]);

  const uploadImages = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      setFieldValue("productImageUrls", [
        ...(values.productImageUrls || []),
        ...newImageUrls,
      ]);
      setFieldValue("productImages", [
        ...(values.productImages || []),
        ...Array.from(files),
      ]);
    }
  };

  const removeImage = (index) => {
    const updatedImages = (values.productImageUrls || []).filter(
      (_, i) => i !== index
    );
    setFieldValue("productImageUrls", updatedImages);

    const updatedFiles = (values.productImages || []).filter(
      (_, i) => i !== index
    );
    setFieldValue("productImages", updatedFiles);
  };

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    setFieldValue,
    resetForm,
    touched,
  } = useFormik({
    enableReinitialize: true,
    initialValues: productData || {
      productName: "",
      productDescription: "",
      SKU: "",
      productPrice: "",
      category: "",
      productTotalStockQty: "",
      discount: 0,
      productImageUrls: [],
      productImages: [],
      keywords: "",
    },
    validationSchema: productSchema,
    onSubmit: async (productData) => {
      try {
        const digitalOceanUrls = productData.productImageUrls.filter(
          (url) =>
            url.includes("digitaloceanspaces.com") && !url.startsWith("blob:")
        );

        const formData = new FormData();
        formData.append("productName", productData.productName);
        formData.append("productDescription", productData.productDescription);
        formData.append("SKU", productData.SKU);
        formData.append("productPrice", productData.productPrice);
        formData.append("category", productData.category);
        formData.append("discount", productData.discount);
        formData.append("keywords", productData.keywords);
        formData.append("productImageDBUrls", [...digitalOceanUrls]);
        console.log(digitalOceanUrls);
        formData.append(
          "productTotalStockQty",
          productData.productTotalStockQty
        );

        if (productData?.productImages?.length > 0) {
          productData?.productImages.forEach((file) => {
            formData.append("productImages", file);
          });
        }

        console.log("Form Data Before Submit:", productData);
        if (productId) {
          const response = await updateProduct({ id: productId, formData });
          if (updateSuccess || response?.data) {
            toast.success(`${response?.data?.message}!!!`);
            router.push("/admin/product");
            resetForm();
          } else if (updateError) {
            toast.error(`${updateErrorDetails?.data?.message}..`);
          }
          console.log(formData);
        } else {
          const response = await createProduct(formData);
          if (createSuccess || response?.data) {
            toast.success(`${response?.data?.message}!!!`);
            router.push("/admin/product");
            resetForm();
          } else if (createSuccess || response.error) {
            toast.error(`${createErrorDetails?.data?.message}..`);
          }
        }
      } catch (error) {
        toast.error("Error submitting the product. Please try again.");
      }
    },
  });

  useEffect(() => {
    if (productData?.category) {
      const categoryId = productData?.category?._id;
      setFieldValue("category", categoryId);
    }
  }, [productData, setFieldValue]);

  if (!productData && productId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full mb-6 ">
      <div className="py-6 px-4 md:pl-8 ">
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
              <BreadcrumbPage>Add Product</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <form
        onSubmit={handleSubmit}
        encType="multipart/form-data"
        className="space-y-6 p-4 md:p-6 my-2 w-[95%]  mx-auto md:max-w-3xl lg:w-[80%] lg:mx-auto bg-white rounded-lg shadow-lg border border-gray-200"
      >
        <h2 className="text-lg lg:text-xl font-bold mb-4 text-primary text-center ">
          {productslug ? "Update Product" : "Add New Product"}
        </h2>

        <div className="grid grid-cols-1  w-full">
          <div className="space-y-4 ">
            <div>
              <Label
                htmlFor="productName"
                className="flex mb-1 gap-2 font-semibold"
              >
                Product Name <p className="text-red-500">*</p>
              </Label>
              <Input
                name="productName"
                type="text"
                placeholder="Enter product name"
                value={values.productName}
                className="w-full p-3 border text-sm border-gray-300 rounded-md "
                onChange={handleChange}
              />
              {errors.productName && touched.productName && (
                <div className={`${error}`}>{errors.productName}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor="category"
                className="flex mb-1 gap-2 font-semibold"
              >
                Category<p className="text-red-500">*</p>
              </Label>
              <Select
                value={values.category}
                onValueChange={(value) => setFieldValue("category", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    {categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.categoryName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              {errors.category && touched.category && (
                <div className={`${error}`}>{errors.category}</div>
              )}
            </div>
            <div>
              <Label htmlFor="SKU" className="flex mb-1 gap-2 font-semibold">
                Stock Keeping Unit <p className="text-red-500">*</p>
              </Label>
              <Input
                name="SKU"
                type="text"
                placeholder="Enter Stock Keeping Unit"
                value={values.SKU}
                className="w-full p-3 border text-sm border-gray-300 rounded-md "
                onChange={handleChange}
              />
              {errors.SKU && touched.SKU && (
                <div className={`${error}`}>{errors.SKU}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor="keywords"
                className="flex mb-1 gap-2 font-semibold"
              >
                Keywords <p className="text-red-500">*</p>
              </Label>
              <Input
                name="keywords"
                type="text"
                placeholder="Enter SEO keywords (comma-separated)"
                value={values.keywords}
                onChange={handleChange}
                className="w-full p-3 border text-sm border-gray-300 rounded-md "
              />
              {errors.keywords && touched.keywords && (
                <div className={`${error}`}>{errors.keywords}</div>
              )}
            </div>

            <div>
              <Label
                htmlFor="productPrice"
                className="flex mb-1 gap-2 font-semibold"
              >
                Price <p className="text-red-500">*</p>
              </Label>
              <Input
                name="productPrice"
                type="text"
                placeholder="Enter product price"
                value={values.productPrice}
                onChange={(e) => {
                  let val = e.target.value;
                  val = val.replace(/[^0-9.]/g, "");
                  const parts = val.split(".");
                  if (parts.length > 2) {
                    val = parts[0] + "." + parts.slice(1).join("");
                  }
                  setFieldValue("productPrice", val);
                }}
                onBlur={() => {
                  const floatVal = parseFloat(values.productPrice);
                  if (!isNaN(floatVal)) {
                    setFieldValue("productPrice", floatVal.toFixed(2));
                  }
                }}
                className="w-full p-3 border text-sm border-gray-300 rounded-md"
              />
              {errors.productPrice && touched.productPrice && (
                <div className={`${error}`}>{errors.productPrice}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor="discount"
                className="flex mb-1 gap-2 font-semibold"
              >
                Discount (%)
              </Label>
              <Input
                name="discount"
                type="text"
                placeholder="Enter discount percentage"
                value={values.discount}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setFieldValue("discount", onlyNumbers);
                }}
                className="w-full p-3 border  text-sm border-gray-300 rounded-md "
              />
              {errors.discount && touched.discount && (
                <div className={`${error}`}>{errors.discount}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor="productTotalStockQty"
                className="flex mb-1 gap-2 font-semibold"
              >
                Total Stock Quantity <p className="text-red-500">*</p>
              </Label>
              <Input
                name="productTotalStockQty"
                placeholder="Enter stock quantity"
                value={values.productTotalStockQty}
                type="text"
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/\D/g, "");
                  setFieldValue("productTotalStockQty", onlyNumbers);
                }}
                className="w-full p-3 border  text-sm border-gray-300 rounded-md "
              />
              {errors.productTotalStockQty && touched.productTotalStockQty && (
                <div className={`${error}`}>{errors.productTotalStockQty}</div>
              )}
            </div>
            <div>
              <Label htmlFor="images" className="flex mb-1 gap-2 font-semibold">
                Images <p className="text-red-500">*</p>
              </Label>
              <div className="mb-4 flex flex-wrap gap-2 w-full justify-start">
                {values.productImageUrls.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="relative h-24 w-24 border rounded-md"
                  >
                    <img
                      src={imageUrl}
                      alt={`Product image ${index}`}
                      className="h-full w-full object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-0 bg-red-500 right-0 h-5 w-5 text-white hover:bg-red-600 items-center flex justify-center pb-1 rounded-sm text-2xl"
                    >
                      ×
                    </button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center p-2 w-24 h-24 cursor-pointer text-center rounded-md shadow-md border transition duration-150 ease-in-out">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6 mb-1"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                    />
                  </svg>
                  <div className="text-xs">Add Image</div>
                  <input
                    type="file"
                    onChange={uploadImages}
                    className="hidden"
                  />
                </label>
              </div>
              {errors.productImageUrls && touched.productImageUrls && (
                <div className={`${error}`}>{errors.productImageUrls}</div>
              )}
            </div>
            <div>
              <Label
                htmlFor="productDescription"
                className="flex mb-1 gap-2 font-semibold"
              >
                Description <p className="text-red-500">*</p>
              </Label>
              <RichTextEditor
                content={values.productDescription}
                onChange={(value) => setFieldValue("productDescription", value)}
                className="border text-sm border-gray-300  rounded-md "
              />
              {errors.productDescription && touched.productDescription && (
                <div className={`${error}`}>{errors.productDescription}</div>
              )}
            </div>

            <Button type="submit" className="w-full">
              {createLoading || updateLoading
                ? "Submitting..."
                : productslug
                ? "Update Product"
                : "Submit Product"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
