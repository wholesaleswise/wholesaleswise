"use client";
import Loading from "@/components/Loading";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import AOS from "aos";
import "aos/dist/aos.css";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEditUserMutation, useGetAllUserQuery } from "@/lib/services/auth";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const ITEMS_PER_PAGE = 20;

const UserTable = () => {
  const { data: userData, isLoading, isError, error } = useGetAllUserQuery();
  const [updateUser, { isLoading: isUpdating }] = useEditUserMutation();
  const [currentPage, setCurrentPage] = useState(1);
  const [editingUser, setEditingUser] = useState(null);

  const users = userData?.users;
  const totalUsers = users?.length || 0;
  const totalPages = Math.ceil(totalUsers / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = users?.slice(startIndex, endIndex) || [];

  // useCallback for memoized functions
  const handlePageChange = useCallback(
    (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
      }
    },
    [totalPages]
  );

  const handleEdit = useCallback((user) => {
    setEditingUser(user);
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingUser(null);
  }, []);

  const handleSelectChange = useCallback((value) => {
    setEditingUser((prev) => ({ ...prev, roles: [value] }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (editingUser) {
        const { _id: userId, email, roles } = editingUser;
        try {
          const response = await updateUser({
            updatedUser: { email, role: roles[0] },
            userId,
          });
          if (response?.data?.message) {
            toast.success(response.data.message);
            setEditingUser(null);
          } else if (response?.error?.data?.message) {
            toast.error(response.error.data.message);
          }
        } catch (error) {
          toast.error(
            error?.response?.data?.message || "An unexpected error occurred."
          );
        }
      }
    },
    [editingUser, updateUser]
  );

  // useEffect for resetting page on data change
  useEffect(() => {
    setCurrentPage(1);
  }, [users]);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [users]);

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex justify-center items-center text-red-500 ">
        <Loading />
      </div>
    );
  }
  if (isError)
    return (
      <div
        className="min-h-[80vh] flex justify-center items-center text-red-500 "
        data-aos="fade-up"
      >
        {error?.data?.message}
      </div>
    );
  if (!users || users.length === 0)
    return (
      <div
        className="min-h-[80vh] flex justify-center items-center text-gray-500 "
        data-aos="fade-up"
      >
        No users found!
      </div>
    );

  return (
    <div className="flex flex-col">
      <div className="rounded-sm  px-5 pt-6 mb-5 shadow-default sm:px-7.5 pb-5">
        <div className="py-4">
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
                <BreadcrumbPage>User List</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-max w-full" data-aos="zoom-in">
            <TableHeader>
              <TableRow className="uppercase text-base bg-table hover:bg-hoverTable">
                <TableHead className="text-white">User ID</TableHead>
                <TableHead className="text-white">User Name</TableHead>
                <TableHead className="text-white">User Email</TableHead>
                <TableHead className="text-white">User Picture</TableHead>
                <TableHead className="text-white">User Phone No.</TableHead>
                <TableHead className="text-white">User Role</TableHead>
                <TableHead className="text-white">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((user, key) => (
                  <TableRow key={key} className=" hover:bg-secondaryTable">
                    <TableCell>{user?._id}</TableCell>
                    <TableCell>{user?.name}</TableCell>
                    <TableCell>{user?.email}</TableCell>
                    <TableCell>
                      <div className=" flex justify-center">
                        {user?.picture
                          ? user?.picture && (
                              <img
                                className="h-[30px] w-[30px] object-contain rounded-full"
                                src={user?.picture}
                                alt={user?.name}
                              />
                            )
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=" flex justify-center">
                        {user.number || "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className=" flex justify-center">
                        <p
                          className={`inline-flex rounded-full py-1 px-3 text-sm font-medium ${
                            user.roles[0] === "admin"
                              ? "bg-green-400 "
                              : "bg-yellow-400 "
                          }`}
                        >
                          {user.roles[0]}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3.5">
                        <Button
                          onClick={() => handleEdit(user)}
                          className="px-3 py-1 rounded text-white bg-table hover:bg-hoverTable disabled:opacity-50"
                          disabled={isUpdating}
                        >
                          Edit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-3 items-center mt-4 w-[90%] pb-8 md:pb-8 mx-auto">
          <Button
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
          >
            <FaChevronLeft />
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
          >
            <FaChevronRight />
          </Button>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Update User Role</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Select
                value={editingUser?.roles[0]}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Role</SelectLabel>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-b from-[#33d058] to-[#115c23] text-white rounded-lg disabled:opacity-50"
                  disabled={isUpdating}
                >
                  {isUpdating ? "Saving..." : "Save Change"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTable;
