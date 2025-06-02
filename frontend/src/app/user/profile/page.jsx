"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useChangePasswordMutation } from "@/lib/services/auth";

import toast from "react-hot-toast";

import { useFormik } from "formik";
import { changePasswordSchema } from "@/validation/schemas";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AvatarCom from "@/components/Avatar";
import { useRouter } from "next/navigation";
import Link from "next/link";

const initialValues = {
  password: "",
  password_confirmation: "",
};
const Profile = () => {
  const [changePassword, { status, error }] = useChangePasswordMutation();
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

  return (
    <div className="container max-auto p-6 pt-0 h-full ">
      <div className="py-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Change Password</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="flex min-h-[75vh] flex-col gap-10 md:flex-row items-center justify-center">
        <div className="w-full max-w-sm ">
          <Card className="overflow-hidden py-6 md:p-4">
            <AvatarCom type="details" />

            <CardContent>
              <h2 className="text-2xl font-bold mb-8 text-center">
                Change Password
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <Label
                    htmlFor="newPassword"
                    className="block font-medium mb-2"
                  >
                    New Password
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
                    className="block font-medium mb-2"
                  >
                    Confirm New Password
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

export default Profile;
