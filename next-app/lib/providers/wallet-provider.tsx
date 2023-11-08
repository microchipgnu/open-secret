"use client"

import "@near-wallet-selector/modal-ui/styles.css";
import { MintbaseWalletContextProvider } from "@mintbase-js/react";

export function WalletProvider({ children }: { children: React.ReactNode }) {

    return (
        <MintbaseWalletContextProvider
            contractAddress="mycontract.mintbase1.near"
            network="mainnet"
            callbackUrl="https://www.mywebsite.com/callback">
            {children}
        </MintbaseWalletContextProvider>
    )
};
