import { getWebsiteInfo } from "@/lib/services/serverSideAPICall";
import OrderDetails from "./page";

export async function generateMetadata({ params }) {
  const websiteInfo = await getWebsiteInfo();
  const orderId = params?.id;

  return {
    title: `Order #${orderId} - ${websiteInfo?.websiteName}`,
    description: `Review details for your order #${orderId} at ${websiteInfo?.websiteName}.`,
  };
}

export default function OrderPage({ params }) {
  const orderId = params?.id;
  return <OrderDetails id={orderId} />;
}
