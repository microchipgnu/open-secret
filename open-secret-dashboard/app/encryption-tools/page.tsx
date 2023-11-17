"use client";
import NotConnected from "@/components/not-connected";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { constants } from "@/lib/constants";
import useOpenSecret from "@/lib/hooks/use-open-secret";
import { useMbWallet } from "@mintbase-js/react";

import React, { useState } from "react";

const DecryptionTools = () => {
  const [inputData, setInputData] = useState("");
  const [nonce, setNonce] = useState("");
  const [decryptedData, setDecryptedData] = useState<{
    sha256: string;
    data: string;
  } | null>(null);

  const { account, generateNewKeyPair, decryptData } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  const handleDecrypt = async () => {
    const decryptedData = await decryptData(inputData, nonce);

    if (!decryptedData) return;

    setDecryptedData(decryptedData);
  };

  return (
    <div className="p-4 text-white">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Data to Decrypt
        </label>
        <div className="flex-col flex gap-4">
          <Input
            onChange={(e) => setInputData(e.target.value)}
            className="max-w-md"
            placeholder="Enter encrypted data here..."
            value={inputData}
          ></Input>
          <Input
            onChange={(e) => setNonce(e.target.value)}
            className="max-w-md"
            placeholder="Nonce"
            value={nonce}
          ></Input>

          {decryptedData && (
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Decrypted Data
              </label>
              <div className="overflow-auto max-w-md bg-gray-800 rounded">
                <div className="p-4 rounded-md">{decryptedData.data}</div>
              </div>
              <label className="block text-sm font-medium mb-2">Sha256</label>
              <div className="overflow-auto max-w-md bg-gray-800 rounded">
                <div className="p-4 rounded-md">{decryptedData.sha256}</div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {decryptedData && (
              <div className="mb-4 ">
                <Button
                  variant="secondary"
                  onClick={() => setDecryptedData(null)}
                >
                  Clear
                </Button>
              </div>
            )}

            <Button onClick={handleDecrypt}>Decrypt Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EncryptionTools = () => {
  const [inputData, setInputData] = useState("");
  const [encryptedData, setEncryptedData] = useState<{
    secret: string;
    nonce: string;
    sha256: string;
  } | null>(null);

  const { account, generateNewKeyPair, encryptData } = useOpenSecret({
    contractId: constants.tokenContractAddress,
  });

  const handleEncrypt = async () => {
    const encryptedData = await encryptData(inputData);

    if (!encryptedData) return;

    setEncryptedData(encryptedData);
  };

  return (
    <div className="p-4 text-white">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">
          Data to Encrypt
        </label>
        <div className="flex-col flex gap-4">
          <Input
            placeholder="Enter data here..."
            className="max-w-md"
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
          ></Input>

          {encryptedData && (
            <div className="mb-4 grid grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Encrypted Data
                </label>
                <div className="overflow-auto max-w-md bg-gray-800 rounded">
                  <div className="p-4 rounded-md">{encryptedData.secret}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Nonce</label>
                <div className="overflow-auto max-w-md bg-gray-800 rounded">
                  <div className="p-4 rounded-md">{encryptedData.nonce}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Public Key
                </label>
                <div className="overflow-auto max-w-md bg-gray-800 rounded">
                  <div className="p-4 rounded-md">{account.publicKey}</div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  SHA-256
                </label>
                <div className="overflow-auto max-w-md bg-gray-800 rounded">
                  <div className="p-4 rounded-md">{encryptedData.sha256}</div>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            {encryptedData && (
              <div className="mb-4 ">
                <Button
                  variant="secondary"
                  onClick={() => setEncryptedData(null)}
                >
                  Clear
                </Button>
              </div>
            )}

            <Button onClick={handleEncrypt}>Encrypt Data</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TokenManagementPage = () => {
  const { isConnected } = useMbWallet();

  if (!isConnected) {
    return <NotConnected />;
  }
  return (
    <>
      <h1 className="text-xl font-semibold text-white mb-2">
        Encryption Tools
      </h1>

      <div className="text-white mb-6">
        Here you can test data encryption and decryption.
      </div>

      <EncryptionTools />
      <DecryptionTools />
    </>
  );
};

export default TokenManagementPage;
