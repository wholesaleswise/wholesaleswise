import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import PrivacyPolicy from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();
  return {
    title: `Privacy Policy - ${websiteInfo?.websiteName || "Our Store"}`,
    description:
      "Read our Privacy Policy to understand how we collect, use, and protect your information.",
  };
}
export default function PrivacyPoliciesPage() {
  return <PrivacyPolicy />;
}
