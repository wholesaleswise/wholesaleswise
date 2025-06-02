import About from "./page";
import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();
  return {
    title: `About Us - ${websiteInfo?.websiteName}`,
    description:
      "Learn about our passion for electronics and commitment to quality.",
  };
}

export default function AboutPage() {
  return <About />;
}
