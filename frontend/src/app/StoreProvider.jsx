"use client";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { Toaster } from "react-hot-toast";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import CookieConsent from "@/components/CookieConsent";
import { useEffect, useState } from "react";

export default function StoreProvider({ children }) {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  return (
    <>
      <PayPalScriptProvider
        options={{
          clientId: `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}`,
          currency: "AUD",
        }}
      >
        <Provider store={store}>{children}</Provider>
        <Toaster />
        {isClient && <CookieConsent />}
      </PayPalScriptProvider>
    </>
  );
}
