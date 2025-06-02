import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import TermsAndConditions from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();
  return {
    title: `Terms and Conditions - ${websiteInfo?.websiteName || "Our Store"}`,
    description:
      "Review our Terms and Conditions to understand your rights and responsibilities while using our services.",
  };
}

export default function TermsPage() {
  return <TermsAndConditions />;
}
