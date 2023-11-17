import Image from "next/image";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toGatewayUrl } from "@/lib/utils";
import { Button } from "./ui/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { ProfileData } from "@/lib/types";
import { callViewMethod } from "@/lib/data/near-rpc-functions";
import { constants } from "@/lib/constants";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";

type ProfileCardProps = {
    profileData: ProfileData,
}

export function ProfileCard({ profileData }: ProfileCardProps) {
    const [searchAccountId, setSearchAccountId] = useState('');
    const router = useRouter();
    const { accountId, name, description, backgroundImage, image } = profileData || {};

    const [profileImageUrl, setProfileImageUrl] = useState<string>('');

    // TODO: fetch profile image url from token metadata for nft's
    const fetchProfileImageUrl = async (contractId: string, tokenId: string) => {
        const data = await callViewMethod({
            contractId: constants.tokenContractAddress,
            method: "nft_metadata",
            args: {
                token_id: tokenId,
            },
        });
    };

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        router.push(`/${searchAccountId}`);
    };


    useEffect(() => {
        if (!profileImageUrl) {
            if (image?.ipfs_cid) {
                setProfileImageUrl(toGatewayUrl(image.ipfs_cid));
            } else if (image?.nft) {
                if (accountId === "root.near") {
                    setProfileImageUrl('https://i.near.social/magic/large/https://near.social/magic/img/account/root.near')
                }
                if (accountId === "mob.near") {
                    setProfileImageUrl('https://i.near.social/magic/large/https://near.social/magic/img/account/mob.near')
                }
            }
            else {
                setProfileImageUrl('https://i.near.social/magic/large/https://near.social/magic/img/account/default')
            }
        }
    }, [profileImageUrl, image, accountId]);


    return (
        <Card className="w-[380px] relative">
            <CardHeader className="overflow-hidden">

                <div className="relative w-full h-24 min-h-[100px]">
                    {backgroundImage?.ipfs_cid && (
                        <>
                            <Image
                                src={toGatewayUrl(backgroundImage.ipfs_cid)}
                                alt={`${name}'s profile banner`}
                                fill
                                loader={({ src }) => src}
                            />
                            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center h-12 bg-gradient-to-t from-black to-transparent">
                            </div>
                            {accountId &&
                                <div className="absolute right-0 top-0 flex items-end justify-end h-full p-2">
                                    <Link href={`https://near.social/mob.near/widget/ProfilePage?accountId=${accountId}`} target="_blank">
                                        <Button className="w-20" variant="outline" size="sm">
                                            {`View `}<ExternalLink className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            }
                        </>
                    )}
                </div>

                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-4 border-white left-10 top-10">
                    <Image
                        className="rounded-full"
                        src={profileImageUrl}
                        alt={`${name}'s profile banner`}
                        fill
                        loader={({ src }) => src}
                    />
                </div>
            </CardHeader>

            <CardContent>
                <CardTitle className="text-center">
                    {name}
                </CardTitle>
                <CardDescription className="text-center max-h-32 overflow-scroll">
                    {description}
                </CardDescription>
            </CardContent>
            <CardFooter>
                <div className="flex w-full">
                    <form onSubmit={handleSearch} className="flex justify-between items-center w-full gap-2">
                        <Input
                            type="text"
                            placeholder="Search by accountId..."
                            value={searchAccountId}
                            onChange={(e) => setSearchAccountId(e.target.value)}
                        />
                        <Button
                            type="submit"
                        >
                            Search
                        </Button>
                    </form>
                </div>
            </CardFooter>
        </Card>
    );
};
