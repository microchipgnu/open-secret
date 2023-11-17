import { useMbWallet } from "@mintbase-js/react";
import { ConnectWallet } from "./connect-wallet";

const NotConnected = () => {
  const { isConnected } = useMbWallet();

  if (isConnected) {
    return null;
  }
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p>You are not connected to an account. Please connect.</p>

      <ConnectWallet />
    </div>
  );
};

export default NotConnected;
