"use client"; 

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

const GoogleAuthCallback = () => {
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
      alert("Authentication failed. Please try again.");
    }
  }, [searchParams, router]);

  return <div>Authenticating...</div>;
};

export default GoogleAuthCallback;
