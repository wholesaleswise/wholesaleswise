// "use client";

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import { Eye } from "lucide-react";
// import Link from "next/link";
// import { useState, useEffect } from "react";
// import { Button } from "../ui/button";
// import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";

// const OrderCom = ({ data }) => {
//   const [sortedOrders, setSortedOrders] = useState(data);
//   const [sortOrder, setSortOrder] = useState("desc");
//   const [statusFilter, setStatusFilter] = useState("");

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(12);

//   useEffect(() => {
//     // Filter orders by status if a filter is selected
//     let filteredOrders = data;
//     if (statusFilter) {
//       filteredOrders = data.filter((order) =>
//         order.orderStatus.includes(statusFilter)
//       );
//     }

//     // Sort orders by created date
//     if (filteredOrders) {
//       filteredOrders = [...filteredOrders].sort((a, b) => {
//         const dateA = new Date(a.createdAt);
//         const dateB = new Date(b.createdAt);
//         return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
//       });
//     }

//     setSortedOrders(filteredOrders);
//   }, [data, statusFilter, sortOrder]);

//   // Get current orders to display based on pagination
//   const indexOfLastOrder = currentPage * itemsPerPage;
//   const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
//   const currentOrders = sortedOrders?.slice(
//     indexOfFirstOrder,
//     indexOfLastOrder
//   );

//   const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

//   const toggleSortOrder = () => {
//     setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
//   };

//   const handleStatusFilterChange = (event) => {
//     setStatusFilter(event.target.value);
//   };

//   // Pagination controls
//   const handleNextPage = () => {
//     if (currentPage < totalPages) {
//       setCurrentPage(currentPage + 1);
//     }
//   };

//   const handlePreviousPage = () => {
//     if (currentPage > 1) {
//       setCurrentPage(currentPage - 1);
//     }
//   };

//   return (
//     <div className="w-full mt-4 mb-8">
//       <div className="py-6 w-[90%] mx-auto">
//         <Breadcrumb>
//           <BreadcrumbList>
//             <BreadcrumbItem>
//               <BreadcrumbLink>
//                 <Link href="/">Home</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />
//             <BreadcrumbItem>
//               <BreadcrumbLink>
//                 <Link href="/admin/dashboard">Admin Dashboard</Link>
//               </BreadcrumbLink>
//             </BreadcrumbItem>
//             <BreadcrumbSeparator />

//             <BreadcrumbItem>
//               <BreadcrumbPage>Manage Order</BreadcrumbPage>
//             </BreadcrumbItem>
//           </BreadcrumbList>
//         </Breadcrumb>
//       </div>

//       {currentOrders.length > 0 ? (
//         <div className="w-[90%] mx-auto flex flex-col justify-center ">
//           <div className="mb-4 flex flex-col gap-4 md:flex-row justify-between">
//             <Button
//               onClick={toggleSortOrder}
//               className="px-4 py-2 text-white bg-[#003c7a] hover:bg-[#255394]"
//             >
//               Sort by Order Date (
//               {sortOrder === "desc" ? "Newest First" : "Oldest First"})
//             </Button>

//             {/* Status Filter Dropdown */}
//             <select
//               value={statusFilter}
//               onChange={handleStatusFilterChange}
//               className="px-4 py-2 border rounded bg-slate-200"
//             >
//               <option value="">All Statuses</option>
//               <option value="Cancelled">Cancelled</option>
//               <option value="Processing">Processing</option>
//               <option value="Shipped">Shipped</option>
//               <option value="Delivered">Delivered</option>
//             </select>
//           </div>

//           <Table className="min-w-max ">
//             <TableHeader>
//               <TableRow className="uppercase text-base bg-[#003c7a] hover:bg-[#255394]">
//                 <TableHead className="text-white">Order ID</TableHead>
//                 <TableHead className="text-white">Product Name</TableHead>
//                 <TableHead className="text-white">Quantity</TableHead>
//                 <TableHead className="text-white">Total Pay Amount</TableHead>
//                 <TableHead className="text-white">Shipping Address</TableHead>
//                 <TableHead className="text-white">User Name</TableHead>
//                 <TableHead className="text-white">User Email</TableHead>
//                 <TableHead className="text-white">Phone Number</TableHead>
//                 <TableHead className="text-white">Payment Method</TableHead>
//                 <TableHead className="text-white">Payment Status</TableHead>
//                 <TableHead className="text-white">Payment ID</TableHead>
//                 <TableHead className="text-white">Order Status</TableHead>
//                 <TableHead className="text-white">Order Date</TableHead>
//                 <TableHead className="text-white">Actions</TableHead>
//               </TableRow>
//             </TableHeader>
//             <TableBody>
//               {currentOrders.map((order) => (
//                 <TableRow key={order._id}>
//                   <TableCell>
//                     <Link
//                       href={`/admin/order/${order?._id}`}
//                       className="text-blue-500"
//                     >
//                       {order?._id}
//                     </Link>
//                   </TableCell>
//                   <TableCell>
//                     {order.productDetails.map((product, index) => (
//                       <div key={index}>{product.productId.productName}</div>
//                     ))}
//                   </TableCell>
//                   <TableCell>
//                     {order.productDetails.map((product, index) => (
//                       <div key={index}>{product.quantity}</div>
//                     ))}
//                   </TableCell>
//                   <TableCell>{order?.totalAmount}</TableCell>
//                   <TableCell>
//                     {order?.shippingAddress?.addressLine1},{" "}
//                     {order?.shippingAddress?.city},{" "}
//                     {order?.shippingAddress?.state},
//                     {order?.shippingAddress.countryCode} -{" "}
//                     {order.shippingAddress.postalCode}
//                   </TableCell>
//                   <TableCell>{order.UserDetails.name}</TableCell>
//                   <TableCell>{order.UserDetails.email}</TableCell>
//                   <TableCell>{order.UserDetails.phoneNumber}</TableCell>
//                   <TableCell>
//                     {order.paymentDetails.payment_method_type[0]}
//                   </TableCell>
//                   <TableCell>{order.paymentDetails.payment_status}</TableCell>
//                   <TableCell>{order.paymentDetails.paymentId}</TableCell>
//                   <TableCell>
//                     {order.orderStatus.map((status, index) => (
//                       <div key={index}>{status}</div>
//                     ))}
//                   </TableCell>
//                   <TableCell>
//                     {new Date(order.createdAt).toLocaleString()}
//                   </TableCell>
//                   <TableCell>
//                     <Link
//                       href={`/admin/order/${order?._id}`}
//                       className="bg-green-800 flex items-center gap-1 text-white px-2 py-1 rounded hover:bg-green-600"
//                     >
//                       <Eye style={{ width: "15px", height: "15px" }} />
//                       view
//                     </Link>
//                   </TableCell>
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//           {/* Pagination Controls */}
//           {totalPages > 1 && (
//             <div className="flex justify-center gap-3 items-center  w-[90%] py-5 mx-auto">
//               <Button
//                 disabled={currentPage === 1}
//                 onClick={handlePreviousPage}
//                 className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
//               >
//                 <FaChevronLeft />
//               </Button>
//               <div className="text-sm">
//                 Page {currentPage} of {totalPages}
//               </div>
//               <Button
//                 disabled={currentPage === totalPages}
//                 onClick={handleNextPage}
//                 className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
//               >
//                 <FaChevronRight />
//               </Button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <div className="flex flex-col items-center justify-center min-h-[50vh]">
//           No orders found here...
//         </div>
//       )}
//     </div>
//   );
// };

// export default OrderCom;

"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Eye } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Button } from "../ui/button";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { MdSearchOff } from "react-icons/md";

const OrderCom = ({ data }) => {
  const [sortOrder, setSortOrder] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Filtered and sorted orders using useMemo for better performance
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = data;

    if (statusFilter) {
      filtered = filtered.filter((order) =>
        order.orderStatus.some((status) =>
          status.toLowerCase().includes(statusFilter.toLowerCase())
        )
      );
    }

    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    return sorted;
  }, [data, statusFilter, sortOrder]);

  // Get current orders for the current page
  const indexOfLastOrder = currentPage * itemsPerPage;
  const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
  const currentOrders = useMemo(() => {
    return filteredAndSortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

  const toggleSortOrder = () => {
    setSortOrder((prevOrder) => (prevOrder === "desc" ? "asc" : "desc"));
    setCurrentPage(1); // Reset page on sort
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setCurrentPage(1); // Reset page on filter
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-0 h-full">
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
              <BreadcrumbPage>Manage Order</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {currentOrders.length > 0 ? (
        <div className="flex flex-col justify-center pt-6">
          <div className="mb-4 flex flex-col gap-4 md:flex-row justify-between">
            <Button
              onClick={toggleSortOrder}
              className="px-4 py-2 text-white bg-primary hover:bg-hover w-full md:w-auto"
            >
              Sort by Order Date (
              {sortOrder === "desc" ? "Newest First" : "Oldest First"})
            </Button>

            {/* Status Filter Dropdown */}
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="px-4 py-2 border rounded bg-slate-200 w-full md:w-auto"
            >
              <option value="">All Statuses</option>
              <option value="cancelled">Cancelled</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
          <Table className="min-w-max ">
            <TableHeader>
              <TableRow className="uppercase text-sm md:text-base bg-table hover:bg-hoverTable">
                <TableHead className="text-white">Order ID</TableHead>
                <TableHead className="text-white">Product Name(s)</TableHead>
                <TableHead className="text-white">Total Quantity</TableHead>
                <TableHead className="text-white">Total Amount</TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  Shipping Address
                </TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  User Name
                </TableHead>
                <TableHead className="text-white hidden lg:table-cell">
                  User Email
                </TableHead>
                <TableHead className="text-white hidden lg:table-cell">
                  Phone
                </TableHead>
                <TableHead className="text-white hidden xl:table-cell">
                  Payment Method
                </TableHead>
                <TableHead className="text-white hidden xl:table-cell">
                  Payment Status
                </TableHead>
                <TableHead className="text-white hidden 2xl:table-cell">
                  Payment ID
                </TableHead>
                <TableHead className="text-white">Order Status</TableHead>
                <TableHead className="text-white hidden md:table-cell">
                  Order Date
                </TableHead>
                <TableHead className="text-white">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrders.map((order) => (
                <TableRow key={order._id} className="hover:bg-secondaryTable">
                  <TableCell>
                    <Link
                      href={`/admin/order/${order?._id}`}
                      className="text-blue-800 hover:underline"
                    >
                      {order?._id}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-md">
                    {order.productDetails.map((product, index) => (
                      <div key={index}>{product.productId?.productName}</div>
                    ))}
                  </TableCell>
                  <TableCell>
                    {order.productDetails.reduce(
                      (sum, product) => sum + product.quantity,
                      0
                    )}
                  </TableCell>
                  <TableCell>{order?.totalAmount}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order?.shippingAddress?.city},{" "}
                    {order?.shippingAddress?.state},{" "}
                    {order?.shippingAddress?.countryCode} -{" "}
                    {order?.shippingAddress?.postalCode}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {order.UserDetails?.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {order.UserDetails?.email}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {order.UserDetails?.phoneNumber}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {order.paymentDetails?.payment_method_type?.[0]}
                  </TableCell>
                  <TableCell className="hidden xl:table-cell">
                    {order.paymentDetails?.payment_status}
                  </TableCell>
                  <TableCell className="hidden 2xl:table-cell">
                    {order.paymentDetails?.paymentId}
                  </TableCell>
                  <TableCell>
                    {order.orderStatus.map((status, index) => (
                      <div key={index} className="capitalize">
                        {status}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(order.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/order/${order?._id}`}
                      className="bg-green-800 flex items-center gap-1 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      <Eye style={{ width: "15px", height: "15px" }} />
                      view
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-3 items-center w-[95%] md:w-[90%] py-5 mx-auto">
              <Button
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
                className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
              >
                <FaChevronLeft />
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                disabled={currentPage === totalPages}
                onClick={handleNextPage}
                className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400 disabled:opacity-50"
              >
                <FaChevronRight />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <MdSearchOff className="text-[70px]" />
          <h2 className="text-xl md:text-2xl font-semibold text-red-800 ">
            Oops! No orders found.
          </h2>
        </div>
      )}
    </div>
  );
};

export default OrderCom;
