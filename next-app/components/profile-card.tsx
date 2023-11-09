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

type ProfileCardProps = {
    profileData: Profile,
}

export function ProfileCard({ profileData }: ProfileCardProps) {
    const { accountId, name, description, backgroundImage, image } = profileData

    return (
        <Card className="w-[380px] relative">

            <CardHeader className="overflow-hidden">
                {backgroundImage?.ipfs_cid && (
                    <div className="relative w-full h-24">
                        <Image
                            src={toGatewayUrl(backgroundImage.ipfs_cid)}
                            alt={`${name}'s profile banner`}
                            fill
                            loader={({ src }) => src}
                        />
                        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center h-12 bg-gradient-to-t from-black to-transparent">
                        </div>
                    </div>
                )}

                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 border-4 border-white left-10 top-10">
                    <Image
                        className="rounded-full"
                        src={toGatewayUrl(image.ipfs_cid)}
                        alt={`${name}'s profile banner`}
                        fill
                        loader={({ src }) => src}
                    />
                </div>

                <div className="absolute right-0 top-0 flex items-end justify-end h-full p-4">
                    <Link href={`https://near.social/mob.near/widget/ProfilePage?accountId=${accountId}`} target="_blank">
                        <Button className="w-20" variant="outline" size="sm">
                            {`View `}<ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </div>
            </CardHeader>

            <CardContent>
                <CardTitle className="text-center">
                    {name}
                </CardTitle>
                <CardDescription className="text-center">
                    {description}
                </CardDescription>
            </CardContent>
        </Card>
    );
};
