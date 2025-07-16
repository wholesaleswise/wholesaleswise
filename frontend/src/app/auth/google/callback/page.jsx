"use client";

import Loading from "@/components/Loading";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import toast from "react-hot-toast";

export const dynamic = "force-dynamic";

function CallbackInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");

    if (token && role) {
      localStorage.setItem("authToken", token);
      localStorage.setItem("role", role);

      if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    } else {
      toast.error("Authentication failed. Please try again.");
    }
  }, [searchParams, router]);

  return <div>Authenticating...</div>;
}

export default function GoogleAuthCallback() {
  return (
    <Suspense
      fallback={
        <div>
          <Loading />
        </div>
      }
    >
      <CallbackInner />
    </Suspense>
  );
}
