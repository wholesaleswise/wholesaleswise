import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import Category from "./page";

export async function generateMetadata({ params }) {
  const websiteInfo = await getWebsiteInfo();
  const category = params.category;
  const formatted = category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${formatted} - ${websiteInfo?.websiteName}`,
    description: `Explore top-quality ${formatted.toLowerCase()} category at ${
      websiteInfo?.websiteName
    }.`,
  };
}

export default function ProductsPage({ params }) {
  const { category } = params;

  return <Category category={category} />;
}
