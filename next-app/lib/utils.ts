import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const generateRandomId = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const toGatewayUrl = (ipfsCid: string) => {
  return `https://ipfs.near.social/ipfs/${ipfsCid}`
  // return `https://ipfs.io/ipfs/${ipfsCid}`
  // return `https:${ipfsCid}.ipfs.nftstorage.link`;
  // return `https:cloudflare-ipfs.com/ipfs/${ipfsCid}`;
}

