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

type ProfileCardProps = {
    profileData: Profile,
}

export function ProfileCard({ profileData }: ProfileCardProps) {
    const { name, description, backgroundImage, image } = profileData

    return (
        <Card className="w-[380px] relative">
            <CardHeader className="overflow-hidden">
                {backgroundImage?.ipfs_cid && (

                    <Image
                        src={toGatewayUrl(backgroundImage.ipfs_cid)}
                        alt={`${name}'s profile banner`}
                        width={380}
                        height={96}
                        loader={({ src }) => src}
                    />

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

            </CardHeader>
            <CardContent className="pt-10">
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>
    );
};
