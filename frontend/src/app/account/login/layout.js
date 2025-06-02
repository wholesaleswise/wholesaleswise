import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import Login from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Login - ${websiteInfo?.websiteName}`,
    description: `Access your account on ${websiteInfo?.websiteName}.`,
  };
}

export default function LoginPage() {
  return <Login />;
}
