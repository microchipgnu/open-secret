"use client";
import React, { useState } from "react";
import { ConnectWallet } from "./connect-wallet";
import { useMbWallet } from "@mintbase-js/react";
import { Button } from "./ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  const { isConnected, disconnect, activeAccountId } = useMbWallet();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <div className="z-30 text-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-semibold">
                Open Secret
              </Link>
              {pathname.startsWith("/data") &&
                pathname.split("/").length > 2 && (
                  <>
                    /
                    <div>
                      <Link href={`/data/${pathname.split("/")[2]}`}>
                        {pathname.split("/")[2]}
                      </Link>
                    </div>
                  </>
                )}
            </div>
            <div className="md:flex md:space-x-4 md:items-center">
              <div className="flex items-center gap-4">
                {!isConnected && <ConnectWallet />}

                {isConnected && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-white"></div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuLabel className="text-xs">
                        {activeAccountId}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={"/account-details"}>Settings</Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>Tools</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={"/encryption-tools"}>Encryption</Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <button className="cursor-pointer" onClick={disconnect}>
                          Disconnect
                        </button>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={"/data"}
                className={`${pathname.startsWith("/data") && "border-b-2"}`}
              >
                <Button
                  disabled={!isConnected}
                  className="w-full"
                  variant={"ghost"}
                >
                  Data Feed Management
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        {/* <div
          className={`border-r flex-shrink-0 w-64 overflow-y-auto z-20 transform transition-all ease-in-out duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <nav className="flex flex-col m-2 gap-2">
            <Link href={"/account-details"}>
              <Button
                disabled={!isConnected}
                className="w-full"
                variant={
                  pathname.startsWith("/account-details") ? "default" : "ghost"
                }
              >
                Account Details
              </Button>
            </Link>
            <Link href={"/data"}>
              <Button
                disabled={!isConnected}
                className="w-full"
                variant={pathname.startsWith("/data") ? "default" : "ghost"}
              >
                Data Feed Management
              </Button>
            </Link>
            <Link href={"/encryption-tools"}>
              <Button
                disabled={!isConnected}
                className="w-full"
                variant={
                  pathname.startsWith("/encryption-tools") ? "default" : "ghost"
                }
              >
                Encryption Tools
              </Button>
            </Link>
          </nav>
        </div> */}

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
