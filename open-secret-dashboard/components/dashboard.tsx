"use client";
import React, { useState } from "react";
import { ConnectWallet } from "./connect-wallet";
import { useMbWallet } from "@mintbase-js/react";
import { Button } from "./ui/button";
import Link from "next/link";

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  const { isConnected } = useMbWallet();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Navbar */}
      <div className="z-30 text-white border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Mobile menu button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-gray-400 hover:text-white focus:outline-none md:hidden"
              >
                <svg
                  className="h-6 w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>

              <Link href="/" className="text-xl font-semibold">
                Open Secret
              </Link>
            </div>
            {/* Desktop menu items */}
            <div className="md:flex md:space-x-4 md:items-center">
              <div>
                <ConnectWallet />
              </div>
              {/* <div className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700">
                Something else
              </div> */}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`border-r flex-shrink-0 w-64 overflow-y-auto z-20 transform transition-all ease-in-out duration-300 ${
            isSidebarOpen ? "block" : "hidden"
          } md:block`}
        >
          <nav className="flex flex-col m-2 gap-2">
            <Link href={"/account-details"}>
              <Button disabled={!isConnected} variant="link">
                Account Details
              </Button>
            </Link>
            <Link href={"/data"}>
              <Button disabled={!isConnected} variant="link">
                Data Feed Management
              </Button>
            </Link>
            <Link href={"/encryption-tools"}>
              <Button disabled={!isConnected} variant="link">
                Encryption Tools
              </Button>
            </Link>
            {/* <Button disabled={!isConnected} variant="link">
              Data Dashboard
            </Button>
            <Button disabled={!isConnected} variant="link">
              Token Dashboard
            </Button>
            <Button disabled={!isConnected} variant="link">
              Key Management
            </Button>
            <Button disabled={!isConnected} variant="link">
              Activity Log
            </Button> */}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <main className="p-4 md:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
