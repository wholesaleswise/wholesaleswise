import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import Checkout from "./page";

export async function generateMetadata() {
  const websiteInfo = await getWebsiteInfo();

  return {
    title: `Complete Order - ${websiteInfo?.websiteName || "Our Store"}`,
    description:
      "Finalize your order and enjoy a seamless checkout experience with fast shipping and secure payment options.",
  };
}

export default function CheckOutPage() {
  return <Checkout />;
}
