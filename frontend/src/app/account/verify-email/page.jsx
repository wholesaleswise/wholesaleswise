"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useFormik } from "formik";
import { verifyEmailSchema } from "@/validation/schemas";

import { useRouter } from "next/navigation";
import { useVerifyEmailMutation } from "@/lib/services/auth";
import toast from "react-hot-toast";
import TermsAndPrivacyLinks from "@/components/TermsAndPrivacyLinks";

const initialValues = {
  email: "",
  otp: "",
};

const VerifyEmail = () => {
  const router = useRouter();
  const [verifyEmail, status] = useVerifyEmailMutation();
  const className = "w-full h-auto object-contain";
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values, action) => {
      try {
        const response = await verifyEmail(values);
        if (response?.data || status?.isSuccess) {
          action.resetForm();
          toast.success(`${response?.data?.message}!!!`);

          router.push("/account/login");
        } else if (response?.error || status?.isError) {
          toast.error(`${response?.error?.data?.message}...`);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error verifying OPT");
      }
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div>
          <Card className="overflow-hidden py-4 md:py-8">
            <CardContent className="">
              <div className="flex justify-center items-center mb-4">
                <Logo className={className} />
              </div>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-xl font-bold">Verify your account</h1>
                    <p className="text-balance text-sm pt-1  text-muted-foreground">
                      Check your email for OTP. OTP is valid for 15 minutes.
                    </p>
                  </div>
                  {status.isLoading && (
                    <div className="text-xs text-red-500">
                      Verifying your email please wait...
                    </div>
                  )}
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="flex gap-2">
                      Email <p className="text-red-500">*</p>
                    </Label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      placeholder="john@gmail.com"
                    />
                    {errors.email && (
                      <div className="text-xs text-red-500">{errors.email}</div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="otpcode" className="flex gap-2">
                      OTP code <p className="text-red-500">*</p>
                    </Label>

                    <Input
                      type="otp"
                      id="otp"
                      name="otp"
                      value={values.otp}
                      onChange={handleChange}
                      placeholder="2341"
                    />
                    {errors.otp && (
                      <div className="text-xs text-red-500">{errors.otp}</div>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={status.isLoading}
                  >
                    verify OPT
                  </Button>

                  <div className="text-center text-sm">
                    Already an User ?
                    <Link
                      href="/account/login"
                      className="underline underline-offset-4"
                    >
                      Login
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <TermsAndPrivacyLinks />
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
