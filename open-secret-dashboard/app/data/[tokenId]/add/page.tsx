"use client";

import { Button } from "@/components/ui/button";
import { IconCheck } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { constants } from "@/lib/constants";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import Link from "next/link";

import { useCallback, useEffect, useState } from "react";

const TokenPage = ({ params }: { params: { tokenId: string } }) => {
  const [inputData, setInputData] = useState("");
  const [encryptedData, setEncryptedData] = useState<{
    secret: string;
    nonce: string;
    sha256: string;
  } | null>(null);
  const { addMetadata, encryptData } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  return (
    <>
      <h1 className="text-xl font-semibold text-white mb-6">
        Adding data to <span className="text-gray-400">{params.tokenId}</span>
      </h1>

      <Input
        onChange={(e) => setInputData(e.target.value)}
        className="max-w-md mb-2"
        placeholder="Enter encrypted data here..."
        value={inputData}
      ></Input>
      <Button
        onClick={() =>
          addMetadata({ tokenId: params.tokenId, data: inputData })
        }
      >
        Encrypt and Store Data
      </Button>
    </>
  );
};

export default TokenPage;
