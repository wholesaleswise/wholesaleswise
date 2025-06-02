"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useGetProtectedQuery } from "@/lib/services/auth";
import Loading from "@/components/Loading";

const Protected = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data: userlogin, isLoading } = useGetProtectedQuery();

  const isAuthenticated = userlogin?.is_auth || false;
  const userRole = userlogin?.role || null;

  useEffect(() => {
    if (isLoading) return;

    if (
      !isAuthenticated &&
      pathname !== "/account/login" &&
      pathname !== "/account/register"
    ) {
      router.push("/account/login");
      return;
    }
    if (isAuthenticated) {
      const redirectUrl = sessionStorage.getItem("redirectUrl");
      if (redirectUrl) {
        sessionStorage.removeItem("redirectUrl");
        router.push(redirectUrl);
        return;
      }
    }
    if (
      isAuthenticated &&
      (pathname === "/account/login" || pathname === "/account/register")
    ) {
      if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/user/order");
      }
      return;
    }

    const isUserRoute = pathname.startsWith("/user");
    const isAdminRoute = pathname.startsWith("/admin");

    if (isAuthenticated && userRole === "admin" && isUserRoute) {
      router.push("/admin/dashboard");
      return;
    }

    if (isAuthenticated && userRole === "user" && isAdminRoute) {
      router.push("/user/order");
      return;
    }
  }, [isLoading, isAuthenticated, userRole, pathname, router]);

  if (isLoading || (userlogin && userlogin.is_auth && !userRole)) {
    return <Loading />;
  }

  return <>{children}</>;
};

export default Protected;
