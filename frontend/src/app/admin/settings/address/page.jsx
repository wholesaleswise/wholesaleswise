"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFormik } from "formik";
import {
  useAddAddressMutation,
  useDeleteAddressMutation,
  useGetAllAddressesQuery,
  useUpdateAddressMutation,
} from "@/lib/services/address";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import React, { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { FaEdit } from "react-icons/fa";
import toast from "react-hot-toast";
import { addressValidationSchema } from "@/validation/schemas";
import scrollTop from "@/components/scrollTop";
import Loading from "@/components/Loading";
import { Label } from "@/components/ui/label";
import Link from "next/link";

const Address = () => {
  const [addressIdToUpdate, setAddressIdToUpdate] = useState("");
  const [address, setAddress] = useState([]);

  const { data: addresses, error, isLoading } = useGetAllAddressesQuery();
  useEffect(() => {
    if (addresses?.addresses) {
      setAddress(addresses?.addresses);
    }
  }, [addresses]);
  console.log(addresses?.addresses);
  const [
    addAddress,
    {
      isLoading: addLoading,
      isSuccess: addSuccess,
      isError: addError,
      error: addErrorDetails,
    },
  ] = useAddAddressMutation();
  const [
    updateAddress,
    {
      isLoading: updateLoading,
      isSuccess: updateSuccess,
      isError: updateError,
      error: updateErrorDetails,
    },
  ] = useUpdateAddressMutation();
  const [
    deleteAddress,
    {
      isLoading: DeleteLoading,
      isSuccess: DeleteSuccess,
      isError: DeleteError,
      error: DeleteErrorDetails,
    },
  ] = useDeleteAddressMutation();

  // Formik for managing form state
  const formik = useFormik({
    initialValues: {
      Address: "",
      DeliveryCharge: "",
    },
    validationSchema: addressValidationSchema,
    onSubmit: async (values) => {
      try {
        if (addressIdToUpdate) {
          const response = await updateAddress({
            id: addressIdToUpdate,
            updatedAddress: {
              Address: values.Address,
              DeliveryCharge: parseFloat(values.DeliveryCharge),
            },
          });
          if (updateSuccess || response?.data) {
            toast.success(`${response?.data?.message}!!!`);
            formik.resetForm();
            setAddressIdToUpdate("");
          } else if (updateError) {
            toast.error(`${updateErrorDetails?.data?.message}..`);
          }
        } else {
          const response = await addAddress({
            Address: values.Address,
            DeliveryCharge: parseFloat(values.DeliveryCharge),
          });
          if (addSuccess || response?.data) {
            toast.success(`${response?.data?.message}!!!`);
            formik.resetForm();
            setAddressIdToUpdate("");
          } else if (addError) {
            toast.error(`${addErrorDetails?.data?.message}..`);
          }
        }
      } catch (err) {
        toast.error(error?.data?.message);
      }
    },
  });

  const handleDeleteAddress = async (id) => {
    try {
      const response = await deleteAddress(id);
      if (DeleteSuccess || response?.data) {
        toast.success(`${response?.data?.message}!!!`);
      } else {
        toast.error(`${DeleteErrorDetails?.data?.message}..`);
      }
    } catch (err) {
      toast.error("Failed to delete address. Please try again.");
    }
  };

  const handleEditClick = (address) => {
    setAddressIdToUpdate(address._id);
    formik.setValues({
      Address: address.Address,
      DeliveryCharge: address.DeliveryCharge.toString(),
    });
  };
  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        <Loading />
      </div>
    );
  }

  return (
    <div className=" container mx-auto p-4 pt-0 ">
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
              <BreadcrumbPage>Manage Address</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Add/Edit Address Form */}
      <div className=" my-2 mx-auto md:max-w-3xl md:w-[80%] lg:w-[60%] pt-6 ">
        <div className=" flex flex-col justify-center min-w-60  sm:min-w-96">
          <div className="bg-white  w-full shadow-lg  hover:shadow-[#f5d0a9] border border-card rounded-sm   px-6 py-10 mb-8 ">
            <h2 className="text-lg lg:text-xl font-bold mb-6 text-primary text-center">
              {addressIdToUpdate
                ? "Edit Shipping Address"
                : "Add New Shipping Address"}
            </h2>
            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <Label
                  htmlFor="address"
                  className=" font-semibold mb-2 flex gap-2 "
                >
                  Address<p className="text-red-500">*</p>
                </Label>
                <Input
                  type="text"
                  placeholder="kathmandu"
                  {...formik.getFieldProps("Address")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formik.touched.Address && formik.errors.Address && (
                  <p className="text-red-600 text-sm">
                    {formik.errors.Address}
                  </p>
                )}
              </div>
              <div>
                <Label
                  htmlFor="deliveryCharge"
                  className=" font-semibold mb-2 flex gap-2 "
                >
                  Delivery Charge <p className="text-red-500">*</p>
                </Label>
                <Input
                  type="number"
                  placeholder="100"
                  {...formik.getFieldProps("DeliveryCharge")}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {formik.touched.DeliveryCharge &&
                  formik.errors.DeliveryCharge && (
                    <p className="text-red-600 text-sm">
                      {formik.errors.DeliveryCharge}
                    </p>
                  )}
              </div>

              <Button
                type="submit"
                className="w-full p-3 "
                disabled={addLoading || updateLoading}
              >
                {addressIdToUpdate ? "Update Address" : "Add Address"}
              </Button>
            </form>
          </div>
        </div>
        <div className="overflow-y-auto max-h-[80vh] min-w-60  sm:min-w-96">
          <h2 className="text-lg lg:text-xl font-bold mt-6 text-center   mb-6">
            All Address :
          </h2>

          {error ? (
            <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
              {error?.data?.message}
            </div>
          ) : address?.length > 0 ? (
            <div className="space-y-4">
              {[...address]
                .sort((a, b) => a.Address.localeCompare(b.Address))
                .map((address) => (
                  <div
                    key={address._id}
                    className="bg-white border-b pb-3 flex gap-4 justify-between items-center m-3"
                  >
                    <div>
                      <p className="text-lg lg:text-xl font-bold text-primary capitalize">
                        {address.Address}
                      </p>
                      <p className="text-sm ">
                        Delivery Charge: AU ${address.DeliveryCharge}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <FaEdit
                        size={20}
                        onClick={() => {
                          handleEditClick(address);
                          scrollTop();
                        }}
                        className="text-blue-900 cursor-pointer"
                      />
                      <Trash2
                        size={20}
                        onClick={() => handleDeleteAddress(address._id)}
                        className="text-red-600 cursor-pointer"
                      />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="min-h-[20vh] flex justify-center items-center text-red-500 ">
              Address data not found!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Address;
