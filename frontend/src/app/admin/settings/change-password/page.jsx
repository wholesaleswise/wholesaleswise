"use client";
import { useFormik } from "formik";
import { changePasswordSchema } from "@/validation/schemas";
import { useChangePasswordMutation } from "@/lib/services/auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import AvatarCom from "@/components/Avatar";
import Link from "next/link";

const initialValues = {
  password: "",
  password_confirmation: "",
};
const ChangePassword = () => {
  const [changePassword, status] = useChangePasswordMutation();
  const { values, errors, handleChange, handleSubmit } = useFormik({
    initialValues,
    validationSchema: changePasswordSchema,
    onSubmit: async (values, action) => {
      try {
        const response = await changePassword(values);
        if (response?.data && response?.data?.status === "success") {
          toast.success(response?.data?.message);

          action.resetForm();
        }
        if (response?.error && response?.error?.data?.status === "failed") {
          toast.error(response?.error?.data?.message);
        }
      } catch (error) {
        console.log("error");
        toast.error(error.response?.error?.data?.message);
      }
    },
  });
  const css = "w-20 h-20 ";
  return (
    <div className="container mx-auto  p-4 pt-0 ">
      <div className="py-6 ">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/admin/dashboard">Admin Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Change Password</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex min-h-[75vh] flex-col items-center justify-center">
        <div className="w-full max-w-sm   ">
          <Card className="overflow-hidden py-6 border ">
            <AvatarCom type="details" css={css} />
            <CardContent>
              <h2 className="text-2xl font-bold mb-6 text-center">
                Change Password
              </h2>
              <form onSubmit={handleSubmit} className="px-2">
                <div className="mb-4">
                  <Label
                    htmlFor="newPassword"
                    className=" font-semibold mb-2 flex gap-2 "
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
                    <div className="text-xs text-red-500 ">
                      {errors.password}
                    </div>
                  )}
                </div>
                <div className="mb-6">
                  <Label
                    htmlFor="confirmPassword"
                    className="font-semibold mb-2 flex gap-2 "
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
                    <div className="text-xs text-red-500 ">
                      {errors.password_confirmation}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={status?.isLoading}
                  className="w-full"
                >
                  Change Password
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
