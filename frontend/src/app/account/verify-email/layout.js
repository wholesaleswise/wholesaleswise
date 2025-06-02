import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import VerifyEmail from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Verify Account - ${websiteInfo?.websiteName}`,
    description: `Verify your account on ${websiteInfo?.websiteName}.`,
  };
}

export default function VerifyAccountPage() {
  return <VerifyEmail />;
}
