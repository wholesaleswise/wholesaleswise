import CategoryForm from "@/components/admin/CategoryForm";

import { use } from "react";

export default function updateCategory({ params }) {
  const { slug } = use(params);

  return (
    <>
      <CategoryForm slug={slug} />
    </>
  );
}
