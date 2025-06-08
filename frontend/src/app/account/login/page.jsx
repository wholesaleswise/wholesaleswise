"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useFormik } from "formik";
import { loginSchema } from "@/validation/schemas";
import { useRouter } from "next/navigation";
import { useLoginUserMutation } from "@/lib/services/auth";
import Link from "next/link";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";
import Protected from "@/protected/Protected";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TermsAndPrivacyLinks from "@/components/TermsAndPrivacyLinks";

// Initial form values
const initialValues = {
  email: "",
  password: "",
};

const Login = () => {
  const router = useRouter();
  const className = "w-20 h-20 object-cover";

  const [loginUser, { isLoading, isSuccess }] = useLoginUserMutation();
  const [showPassword, setShowPassword] = useState(false);

  // Formik hook for form handling
  const { values, errors, handleChange, handleSubmit, touched } = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, action) => {
      try {
        const response = await loginUser(values);
        if (response?.data?.user || isSuccess) {
          toast.success(`${response?.data?.message}!!!`);
          action.resetForm();
          const userRole = response?.data?.user?.roles;
          if (userRole === "admin") {
            router.push("/admin/dashboard");
          } else {
            router.push("/");
          }
        } else {
          toast.error(`${response?.error?.data?.message}...`);
        }
      } catch (error) {
        console.log(error);
      }
    },
  });

  // Function to handle Google login
  const handleGoogleLogin = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/auth/google`,
      "_self"
    );
  };

  return (
    <Protected>
      <div className="flex min-h-screen flex-col items-center justify-center bg-muted py-6 px-2 md:p-10">
        <div className="w-full max-w-sm">
          <Card className="overflow-hidden py-4 md:py-8 px-2 md:px-4">
            <CardContent>
              {/* logo */}
              <div className="flex justify-center items-center ">
                <Logo className={className} />
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <h1 className="text-xl mt-5 font-bold">Welcome back</h1>
                  <p className="text-balance text-sm pt-1 sm:text-base text-muted-foreground">
                    Login to your account
                  </p>
                </div>
                {/* login form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex gap-2">
                      Email <p className="text-red-500">*</p>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="john@gmail.com"
                    />
                    {touched.email && errors.email && (
                      <div className="text-xs text-red-500">{errors.email}</div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="password" className="flex gap-2">
                        Password <p className="text-red-500">*</p>
                      </Label>
                      <Link
                        href="/account/reset-password-link"
                        className="ml-auto text-sm text-primary hidden sm:block hover:underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={values.password}
                        onChange={handleChange}
                        placeholder="*******"
                      />
                      {values.password && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                        >
                          {showPassword ? (
                            <Eye size={16} />
                          ) : (
                            <EyeOff size={16} />
                          )}
                        </button>
                      )}
                    </div>
                    {touched.password && errors.password && (
                      <div className="text-xs text-red-500">
                        {errors.password}
                      </div>
                    )}
                    <Link
                      href="/account/reset-password-link"
                      className="pt-2 text-sm underline-offset-2 sm:hidden hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    Login
                  </Button>
                </form>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
                {/* with google */}
                <Button
                  variant="outline"
                  onClick={handleGoogleLogin}
                  className="flex items-center justify-center w-full"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className=" text-indigo-500 fill-current"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    ></path>
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    ></path>
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    ></path>
                  </svg>
                  Login with Google
                </Button>
                <div className="text-center text-sm">
                  Don&apos;t have an account?
                  <Link
                    href="/account/register"
                    className="text-primary underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          <TermsAndPrivacyLinks />
        </div>
      </div>
    </Protected>
  );
};

export default Login;
