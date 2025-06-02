"use client";
import { useFormik } from "formik";
import { useParams, useRouter } from "next/navigation";
import { resetPasswordSchema } from "@/validation/schemas";
import { useResetPasswordMutation } from "@/lib/services/auth";

import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const initialValues = {
  password: "",
  password_confirmation: "",
};
const ResetPasswordConfirm = () => {
  const router = useRouter();
  const { id, token } = useParams();
  const [resetPassword, status] = useResetPasswordMutation();
  const className = "max-w-sm h-20  object-contain ";
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, action) => {
      try {
        const data = { ...values, id, token };
        const response = await resetPassword(data);
        if (response?.data && response?.data?.status === "success") {
          toast.success(response?.data?.message);
          action.resetForm();
          router.push("/account/login");
        }
        if (response?.error && response?.error?.data?.status === "failed") {
          toast.error(response?.error?.data?.message);
        }
      } catch (error) {
        toast.error(error?.response?.error?.data?.message);
      }
    },
  });

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-2 md:p-10">
      <div className="w-full max-w-sm ">
        <Card className="overflow-hidden py-10 px-2">
          <div className="flex justify-center items-center mb-4">
            <Logo className={className} />
          </div>
          <CardContent>
            <h2 className="text-xl font-bold mb-6 text-center">
              Reset Password
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <Label
                  htmlFor="newPassword"
                  className=" font-medium mb-2 flex gap-2"
                >
                  New Password <p className="text-red-500">*</p>
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                />
                {errors.password && (
                  <div className="text-xs text-red-500 ">{errors.password}</div>
                )}
              </div>
              <div className="mb-6">
                <Label
                  htmlFor="confirmPassword"
                  className="flex gap-2 font-medium mb-2"
                >
                  Confirm New Password <p className="text-red-500">*</p>
                </Label>
                <Input
                  type="password"
                  id="password_confirmation"
                  name="password_confirmation"
                  value={values.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                />
                {errors.password_confirmation && (
                  <div className="text-xs text-red-500">
                    {errors.password_confirmation}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={status.isLoading}
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordConfirm;
