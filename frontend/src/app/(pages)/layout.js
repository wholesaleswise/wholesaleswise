"use client";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <>
      <div className="">
        <Navbar />
      </div>

      {/* w-[96%] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 */}
      <div>
        <div className="mt-[142px] sm:mt-[72px] md:mt-[116px]">{children}</div>{" "}
        {/* Corrected margin class */}
      </div>
      <Footer />
    </>
  );
}
