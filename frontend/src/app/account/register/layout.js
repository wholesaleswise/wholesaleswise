import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import Register from "./page";
export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Register - ${websiteInfo?.websiteName}`,
    description: `Create an account on ${websiteInfo?.websiteName} to get started.`,
  };
}

export default function RegisterPage() {
  return <Register />;
}
