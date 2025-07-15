"use client";
import { useEffect, useState } from "react";
import * as gtag from "@/lib/gtag";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (consent === "accept") {
      gtag.loadGA();
    } else {
      setShow(true);
    }
  }, []);

  const handleChoice = (choice) => {
    localStorage.setItem("cookieConsent", choice);
    if (choice === "accept") gtag.loadGA();
    setShow(false);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleChoice("decline");
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end bg-black/40 px-4 py-4 sm:items-end sm:justify-end">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        className="relative bg-white w-full max-w-sm rounded-xl shadow-xl p-5 border border-gray-200 animate-slideUp"
      >
        <button
          onClick={() => handleChoice("decline")}
          aria-label="Close"
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition text-xl"
        >
          &times;
        </button>

        <h2
          id="cookie-title"
          className="text-base font-semibold text-gray-800 mb-2"
        >
          Cookie Settings
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          By selecting <strong>“Accept All Cookies”</strong>, you agree to the
          storing of cookies on your device to enhance site navigation, analyze
          site usage, and assist in our marketing efforts. Read our{" "}
          <a
            href="/terms-condition"
            className="text-blue-600 underline hover:text-blue-800 transition"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms of Use
          </a>
          .
        </p>
        <div className="flex justify-end gap-2 flex-wrap">
          <button
            onClick={() => handleChoice("decline")}
            className="px-4 py-1.5 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Decline
          </button>
          <button
            onClick={() => handleChoice("accept")}
            className="px-4 py-1.5 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
