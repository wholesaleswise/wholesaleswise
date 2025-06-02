import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import AllCategory from "./page";
export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Categories - ${websiteInfo?.websiteName || "Our Store"}`,
    description:
      "Browse through our wide range of categories in electronics, designed to meet all your tech needs.",
  };
}

export default function CategoriesPage() {
  return <AllCategory />;
}
