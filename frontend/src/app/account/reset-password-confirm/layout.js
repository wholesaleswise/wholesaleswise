import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import ResetPasswordConfirm from "./[id]/[token]/page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Reset Password - ${websiteInfo?.websiteName}`,
    description: `Reset your Password on ${websiteInfo?.websiteName}.`,
  };
}

export default function ForgotPasswordPage() {
  return <ResetPasswordConfirm />;
}
