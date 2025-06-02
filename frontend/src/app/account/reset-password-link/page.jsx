"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import Link from "next/link";
import { useFormik } from "formik";
import { resetPasswordLinkSchema } from "@/validation/schemas";
import { useResetPasswordLinkMutation } from "@/lib/services/auth";

import toast from "react-hot-toast";
import TermsAndPrivacyLinks from "@/components/TermsAndPrivacyLinks";
import { useRouter } from "next/navigation";

const initialValues = {
  email: "",
};
const ResetPasswordLink = () => {
  const className = "max-w-sm h-20  object-contain ";
  const router = useRouter();
  const [resetPasswordLink, status] = useResetPasswordLinkMutation();
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: resetPasswordLinkSchema,
    onSubmit: async (values, action) => {
      try {
        const response = await resetPasswordLink(values);
        if (response?.data || status?.isSuccess) {
          action.resetForm();
          router.push("/account/login");
          toast.success(`${response?.data?.message}!!!`);
        } else if (response?.error || status?.isError) {
          toast.error(`${response?.error?.data?.message}...`);
        }
      } catch (error) {
        toast.error("Error sign up to account");
      }
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10 ">
      <div className="w-full max-w-sm">
        <div>
          <Card className="overflow-hidden py-4 md:py-8 px-2 md:px-4 ">
            <CardContent className="">
              <div className="flex justify-center items-center mb-3 ">
                <Logo className={className} />
              </div>
              <form className="" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-xl font-bold">
                      Reset Password
                    </h1>
                    <p className="text-balance text-xs pt-1 sm:text-base text-muted-foreground">
                      Enter your details below
                    </p>
                  </div>
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
                    {errors.email && (
                      <div className="text-xs text-red-500 ">
                        {errors.email}
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={status?.isLoading}
                  >
                    {status?.isLoading ? "Sending email...." : "Send"}
                  </Button>

                  <div className="text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/account/register"
                      className="underline text-primary"
                    >
                      Create an account
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

export default ResetPasswordLink;
