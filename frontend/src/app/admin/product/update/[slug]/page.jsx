import ProductForm from "@/components/admin/ProductForm";
import { use } from "react";

export default function updateProduct({ params }) {
  const { slug } = use(params);

  return (
    <>
      <ProductForm slug={slug} />
    </>
  );
}
