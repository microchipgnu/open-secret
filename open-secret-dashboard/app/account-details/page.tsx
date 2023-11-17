"use client";
import NotConnected from "@/components/not-connected";
import { Button } from "@/components/ui/button";
import { constants } from "@/lib/constants";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import { useMbWallet } from "@mintbase-js/react";

const AccountDetailsPage = () => {
  const { isConnected } = useMbWallet();
  const { account, generateNewKeyPair } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  if (!isConnected) {
    return <NotConnected />;
  }
  return (
    <>
      <h1 className="text-xl font-semibold text-white mb-2">Account Details</h1>
      <div className="text-white mb-6">Your account details.</div>

      <div className="flex flex-col gap-2 mb-6">
        <div>
          <div className="text-white flex gap-2 items-center">
            <span className="text-sm">Account Id</span>
            <span className="px-2 py-1 bg-gray-800 bg-muted/50 rounded">
              {account?.accountId}
            </span>
          </div>
        </div>
        <div>
          <div className="text-white flex gap-2 items-center">
            <span className="text-sm">Public Key</span>
            <span className="px-2 py-1 bg-gray-800 bg-muted/50 rounded">
              {account?.publicKey}
            </span>
          </div>
        </div>
      </div>
      <Button onClick={() => generateNewKeyPair()} variant="destructive">
        Generate New Keypair
      </Button>
    </>
  );
};

export default AccountDetailsPage;
