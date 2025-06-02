import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import ResetPasswordLink from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Forgot Password - ${websiteInfo?.websiteName}`,
    description: `Recover your account on ${websiteInfo?.websiteName}.`,
  };
}

export default function ForgotPasswordPage() {
  return <ResetPasswordLink />;
}
