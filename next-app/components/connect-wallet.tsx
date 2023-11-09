'use client'

import { useMbWallet } from "@mintbase-js/react"
import { Button } from "@/components/ui/button"

export function ConnectWallet() {
    const { connect, disconnect, isConnected } = useMbWallet()

    return (
        <Button
            className="mr-4 w-[160px]"
            onClick={() => {
                if (isConnected) {
                    disconnect()
                } else {
                    connect()
                }
            }}
        >
            {isConnected ? "Disconnect" : "Connect Wallet"}
        </Button>
    )
};
