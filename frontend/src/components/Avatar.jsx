"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGetUserQuery } from "@/lib/services/auth";

const AvatarCom = ({ type, css }) => {
  const [user, setUser] = useState(null);

  const { data, isSuccess } = useGetUserQuery();
  useEffect(() => {
    if (data && isSuccess) {
      setUser(data.user);
    }
  }, [data, isSuccess]);

  const avatarUrl = user?.name
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        user?.name
      )}`
    : null;

  return (
    <>
      {user?.email ? (
        <>
          <div className="flex flex-col items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className={`${css} cursor-pointer`}>
                    {/* <img src={user?.picture} alt={user?.name} /> */}
                    <AvatarImage
                      src={user?.picture || avatarUrl}
                      alt={user?.name}
                    />
                    <AvatarFallback>
                      {user?.name ? user?.name[0] : null}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{user?.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {type === "details" && (
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-semibold">
                  {user?.name}
                </CardTitle>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </CardHeader>
            )}
          </div>
        </>
      ) : null}
    </>
  );
};

export default AvatarCom;
