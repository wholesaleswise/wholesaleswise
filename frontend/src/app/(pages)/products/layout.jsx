import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import Products from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Products - ${websiteInfo?.websiteName || "Our Store"}`,
    description:
      "Explore our full catalog of electronics and tech gear built for performance and durability.",
    openGraph: {
      title: `All Products - ${websiteInfo?.websiteName || "Our Store"}`,
      description:
        "Explore our full catalog of electronics and tech gear built for performance and durability.",
    },
  };
}

export default async function ProductsPage() {
  return <Products />;
}
