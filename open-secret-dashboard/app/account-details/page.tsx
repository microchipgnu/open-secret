"use client";
import NotConnected from "@/components/not-connected";
import { Button } from "@/components/ui/button";
import { constants } from "@/lib/constants";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import { useMbWallet } from "@mintbase-js/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConnectWallet } from "@/components/connect-wallet";

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
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>These are your account details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 mb-6">
            <div>
              <Badge variant="outline"> {account?.accountId}</Badge>
            </div>
            <div>
              <Badge variant="outline"> {account?.publicKey}</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4">
          <Button onClick={() => generateNewKeyPair()} variant="destructive">
            Generate New Keypair
          </Button>
          <ConnectWallet />
        </CardFooter>
      </Card>
    </>
  );
};

export default AccountDetailsPage;
