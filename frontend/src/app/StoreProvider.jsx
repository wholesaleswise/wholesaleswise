"use client";
import { Provider } from "react-redux";
import { store } from "@/lib/store";
import { Toaster } from "react-hot-toast";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
export default function StoreProvider({ children }) {
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
      </PayPalScriptProvider>
    </>
  );
}
